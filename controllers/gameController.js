const Game = require("../models/game");
const Publisher = require("../models/publisher");
const Franchise = require("../models/franchise");
const Genre = require("../models/genre");
const GameInstance = require("../models/gameinstance");
var path = require("path");
const {
  body: check,
  validationResult,
  checkSchema,
  body,
} = require("express-validator");
const multer = require("multer");
const fs = require("fs");

function checkImageErrors(req, file, cb) {
  let format = file.mimetype.split("/");
  if (
    format[1] === "jpg" ||
    format[1] === "png" ||
    format[1] === "jpeg" ||
    format[1] === "webp"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
}

const Storage = multer.diskStorage({
  destination: "public/images/games",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: Storage,
  fileFilter(req, file, callback) {
    checkImageErrors(req, file, callback);
  },
});

const async = require("async");

exports.index = (req, res) => {
  async.parallel(
    {
      game_count(callback) {
        Game.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
      },
      game_instance_count(callback) {
        GameInstance.countDocuments({}, callback);
      },
      game_instance_available_count(callback) {
        GameInstance.countDocuments({ status: "Available" }, callback);
      },
      publisher_count(callback) {
        Publisher.countDocuments({}, callback);
      },
      //Added for franchise
      franchise_count(callback) {
        Franchise.countDocuments({}, callback);
      },
      genre_count(callback) {
        Genre.countDocuments({}, callback);
      },
    },
    (err, results) => {
      res.render("index", {
        title: "Game Inventory Home",
        error: err,
        data: results,
      });
    }
  );
};

// Display list of all Games.
exports.game_list = function (req, res, next) {
  Game.find({}, "title publisher")
    .sort({ title: 1 })
    .populate("image")
    .populate("genre")
    .populate("franchise")
    .populate("publisher")
    .exec(function (err, list_games) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render("game_list", { title: "Game List", game_list: list_games });
    });
};

// Display detail page for a specific game.
exports.game_detail = (req, res, next) => {
  async.parallel(
    {
      game(callback) {
        Game.findById(req.params.id)
          .populate("publisher")
          .populate("franchise")
          .populate("genre")
          .exec(callback);
      },
      game_instance(callback) {
        GameInstance.find({ game: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.game == null) {
        // No results.
        const err = new Error("Game not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("game_detail", {
        title: results.game.title,
        game: results.game,
        game_instances: results.game_instance,
      });
    }
  );
};

// Display game create form on GET.
exports.game_create_get = (req, res, next) => {
  // Get all publishers and genres, which we can use for adding to our game.
  async.parallel(
    {
      publishers(callback) {
        Publisher.find(callback);
      },
      //Added Franchise
      franchises(callback) {
        Franchise.find(callback);
      },
      genres(callback) {
        Genre.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      res.render("game_form", {
        title: "Create Game",
        publishers: results.publishers,
        franchises: results.franchises,
        genres: results.genres,
        passcode: false,
      });
    }
  );
};

//-------------- Handle game create on POST.--------------//
exports.game_create_post = [
  // Convert the genre to an array.

  (req, res, next) => {
    if (!Array.isArray(req.body.franchise)) {
      req.body.franchise =
        typeof req.body.franchise === "undefined" || ""
          ? []
          : [req.body.franchise];
    }
    next();
  },

  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre =
        typeof req.body.genre === "undefined" || "" ? [] : [req.body.genre];
    }
    next();
  },

  // Validate and sanitize fields.
  upload.single("image"),
  check("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  check("publisher", "Publisher must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  check("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  //   body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),
  check("franchise.*").escape(),
  check("genre.*").escape(),
  checkSchema({
    image: {
      custom: {
        options: (value, { req, location, path }) => {
          return !!req.file;
        },
        errorMessage:
          "You need to upload a product image in format .jpg, .jpeg, .png, or .webp. File size should be less than 5MB",
      },
    },
  }),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // //For image upload
    // upload(req, res, (err) => {
    //   if (err) {
    //     console.log();
    //   } else {
    //     const newImage = new ImageModel({
    //       image: {
    //         data: req.file.filename,
    //         contentType: "image/png",
    //       },
    //     });
    //   }
    // });

    // Create a Game object with escaped and trimmed data.
    const game = new Game({
      title: req.body.title,
      publisher: req.body.publisher,
      summary: req.body.summary,
      image: undefined === req.file ? "" : req.file.filename,
      franchise: req.body.franchise,
      genre: req.body.genre,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      if (!!req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.log(err.message);
        });
      }
      // Get all publishers and genres for form.
      async.parallel(
        {
          publishers(callback) {
            Publisher.find(callback);
          },
          franchises(callback) {
            Franchise.find(callback);
          },
          genres(callback) {
            Genre.find(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }

          // Mark our selected genres as checked.
          for (const genre of results.genres) {
            if (game.genre.includes(genre._id)) {
              genre.checked = "true";
            }
          }
          res.render("game_form", {
            title: "Create Game",
            publishers: results.publishers,
            franchises: results.franchises,
            genres: results.genres,
            game: game,
            passcode: false,
            errors: errors.array(),
          });
        }
      );
      return;
    }

    // Data from form is valid. Save game.
    game.save((err) => {
      if (err) {
        return next(err);
      }
      // Successful: redirect to new game record.
      res.redirect(game.url);
    });
  },
];

// Display game delete form on GET
exports.game_delete_get = function (req, res, next) {
  async.parallel(
    {
      game: function (callback) {
        Game.findById(req.params.id).exec(callback);
      },
      games_gameinstances: function (callback) {
        GameInstance.find({ game: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.game == null) {
        // No results
        res.redirect("/catalog/games");
      }
      // Successful, so render

      res.render("game_delete", {
        title: "Delete Game",
        game: results.game,
        games_gameinstances: results.games_gameinstances,
      });
    }
  );
};

// Handle game delete on POST
exports.game_delete_post = function (req, res, next) {
  body("passcode")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Passcode must be specified."),
    async.parallel(
      {
        game: function (callback) {
          Game.findById(req.params.id).exec(callback);
        },
        games_gameinstances: function (callback) {
          GameInstance.find({ game: req.params.id }).exec(callback);
        },
      },
      function (err, results) {
        if (err) {
          return next(err);
        }
        // Success
        if (results.games_gameinstances.length > 0) {
          // Game has gameinstances. Render in the same way as for GET route.
          res.render("game_delete", {
            title: "Delete Game",
            game: results.game,
            games_gameinstances: results.games_gameinstances,
          });
          return;
        }
        if (req.body.passcode != process.env.ADMIN_PASSCODE) {
          return res.render("game_delete", {
            title: "Delete Game",
            game: results.game,
            games_gameinstances: results.games_gameinstances,
            passcodeError: "Wrong Passcode",
          });
        }
        // Game has no gameinstances. Delete object and redirect to the landing page.
        Game.findByIdAndRemove(req.body.gameid, function deleteGame(err) {
          if (err) return next(err);
          // Success - go to game list
          res.redirect("/catalog/games");
        });
      }
    );
};

// Display game update form on GET.
exports.game_update_get = (req, res, next) => {
  // Get game, publishers and genres for form.
  async.parallel(
    {
      game(callback) {
        Game.findById(req.params.id)
          .populate("publisher")
          //Add franchise
          .populate("franchise")
          .populate("genre")
          .exec(callback);
      },
      publishers(callback) {
        Publisher.find(callback);
      },
      franchises(callback) {
        Franchise.find(callback);
      },
      genres(callback) {
        Genre.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.game == null) {
        // No results.
        const err = new Error("Game not found");
        err.status = 404;
        return next(err);
      }
      // Success.
      // Mark our selected genres as checked.
      for (const genre of results.genres) {
        for (const gameGenre of results.game.genre) {
          if (genre._id.toString() === gameGenre._id.toString()) {
            genre.checked = "true";
          }
        }
      }
      res.render("game_form", {
        title: "Update Game",
        publishers: results.publishers,
        franchises: results.franchises,
        genres: results.genres,
        game: results.game,
        passcode: true,
      });
    }
  );
};

// Handle game update on POST.
exports.game_update_post = [
  // Convert the genre to an array
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre =
        typeof req.body.genre === "undefined" ? [] : [req.body.genre];
    }
    next();
  },

  // Validate and sanitize fields.
  upload.single("image"),
  check("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  check("publisher", "Publisher must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  check("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  check("franchise.*").escape(),
  check("genre.*").escape(),
  body("passcode").custom((value, { req }) => {
    if (req.body.passcode === process.env.ADMIN_PASSCODE) {
      return true;
    } else {
      throw new Error("Wrong password");
    }
  }),
  checkSchema({
    image: {
      custom: {
        options: (value, { req, location, path }) => {
          return !!req.file;
        },
        errorMessage:
          "You need to upload a game image in format .jpg, .jpeg, .png or .webp. File size should be less than 5MB.",
      },
    },
  }),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Game object with escaped/trimmed data and old id.
    const game = new Game({
      title: req.body.title,
      publisher: req.body.publisher,
      summary: req.body.summary,
      image: undefined === req.file ? "" : req.file.filename,
      franchise: req.body.franchise,
      genre: typeof req.body.genre === "undefined" ? [] : req.body.genre,
      _id: req.params.id, //This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      if (!!req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.log(err.message);
        });
      }
      // Get all publishers and genres for form.
      async.parallel(
        {
          publishers(callback) {
            Publisher.find(callback);
          },
          franchises(callback) {
            Franchise.find(callback);
          },
          genres(callback) {
            Genre.find(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }

          // Mark our selected genres as checked.
          for (const genre of results.genres) {
            if (game.genre.includes(genre._id)) {
              genre.checked = "true";
            }
          }
          res.render("game_form", {
            title: "Update Game",
            publishers: results.publishers,
            franchises: results.franchises,
            genres: results.genres,
            game: game,
            passcode: true,
            errors: errors.array(),
          });
        }
      );
      return;
    }

    // Data from form is valid. Update the record.
    Game.findByIdAndUpdate(req.params.id, game, {}, (err, thegame) => {
      if (err) {
        return next(err);
      }

      // Successful: redirect to game detail page.
      res.redirect(thegame.url);
    });
  },
];
