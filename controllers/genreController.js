const Genre = require("../models/genre");
const Game = require("../models/game"); //b00k
const async = require("async");
const { body, validationResult } = require("express-validator");

// Display list of all Genres.
exports.genre_list = function (req, res, next) {
  Genre.find()
    .sort([["name", "ascending"]])
    .exec(function (err, list_genres) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render("genre_list", {
        title: "Genre List",
        genre_list: list_genres,
      });
    });
};

// Display detail page for a specific Genre.
exports.genre_detail = (req, res, next) => {
  async.parallel(
    {
      genre(callback) {
        Genre.findById(req.params.id).exec(callback);
      },

      genre_games(callback) {
        Game.find({ genre: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.genre == null) {
        // No results.
        const err = new Error("Genre not found");
        err.status = 404;
        return next(err);
      }

      // Successful, so render
      res.render("genre_detail", {
        title: "Genre Detail",
        genre: results.genre,
        genre_games: results.genre_games,
      });
    }
  );
};

// Display Genre create form on GET.
exports.genre_create_get = (req, res, next) => {
  res.render("genre_form", { title: "Create Genre", passcode: false });
};

// Handle Genre create on POST.
exports.genre_create_post = [
  // Validate and sanitize the name field.
  body("name", "Genre name required").trim().isLength({ min: 1 }).escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data.
    const genre = new Genre({ name: req.body.name });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("genre_form", {
        title: "Create Genre",
        genre,
        passcode: false,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if Genre with same name already exists.
      Genre.findOne({ name: req.body.name }).exec((err, found_genre) => {
        if (err) {
          return next(err);
        }

        if (found_genre) {
          // Genre exists, redirect to its detail page.
          res.redirect(found_genre.url);
        } else {
          genre.save((err) => {
            if (err) {
              return next(err);
            }
            // Genre saved. Redirect to genre detail page.
            res.redirect(genre.url);
          });
        }
      });
    }
  },
];

// Display Genre delete form on GET.
exports.genre_delete_get = function (req, res, next) {
  async.parallel(
    {
      genre: function (callback) {
        Genre.findById(req.params.id).exec(callback);
      },
      genres_games: function (callback) {
        Game.find({ genre: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.genre == null) {
        // No results.
        res.redirect("/catalog/genres");
      }
      // Successful, so render.
      res.render("genre_delete", {
        title: "Delete Genre",
        genre: results.genre,
        genres_games: results.genres_games,
      });
    }
  );
};

// Handle Genre delete on POST.
exports.genre_delete_post = function (req, res, next) {
  body("passcode")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Passcode must be specified."),
    async.parallel(
      {
        genre: function (callback) {
          Genre.findById(req.body.genreid).exec(callback);
        },
        genres_games: function (callback) {
          Game.find({ genre: req.body.genreid }).exec(callback);
        },
      },
      function (err, results) {
        if (err) {
          return next(err);
        }
        // Success
        if (results.genres_games.length > 0) {
          // Genre has games. Render in same way as for GET route.
          res.render("genre_delete", {
            title: "Delete Genre",
            genre: results.genre,
            genres_games: results.genres_games,
          });
          return;
        }
        if (req.body.passcode != process.env.ADMIN_PASSCODE) {
          return res.render("genre_delete", {
            title: "Delete Genre",
            genre: results.genre,
            genres_games: results.genres_games,
            passcodeError: "Wrong Passcode",
          });
        } else {
          // Genre has no games. Delete object and redirect to the landing page
          Genre.findByIdAndRemove(req.body.genreid, function deleteGenre(err) {
            if (err) {
              return next(err);
            }
            // Success - go to genre list
            res.redirect("/catalog/genres");
          });
        }
      }
    );
};

// Display Genre update form on GET.
exports.genre_update_get = function (req, res, next) {
  async.parallel(
    {
      genre: function (callback) {
        Genre.findById(req.params.id).exec(callback);
      },
    },
    function (err, results) {
      if (err) return next(err);
      res.render("genre_form", {
        title: "Update Genre",
        genre: results.genre,
        passcode: true,
      });
    }
  );
};

// Handle Genre update on POST.
exports.genre_update_post = [
  // Validation and Sanitization
  body("name", "Genre must not be empty.").trim().isLength({ min: 1 }).escape(),
  body("passcode").custom((value, { req }) => {
    if (req.body.passcode === process.env.ADMIN_PASSCODE) {
      return true;
    } else {
      throw new Error("Wrong password");
    }
  }),

  // Process post validation and sanitization
  (req, res, next) => {
    const errors = validationResult(req);

    var genre = new Genre({
      title: req.body.title,
      name: req.body.name,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      async.parallel(
        {
          genre: function (callback) {
            Genre.findById(req.params.id).exec(callback);
          },
        },
        function (err, results) {
          if (err) return next(err);
          res.render("genre_form", {
            title: "Update Genre",
            genre: results.genre,
            passcode: true,
            errors: errors.array(),
          });
        }
      );
      return;
    } else {
      // Data from form is valid
      // Check if Genre with same name already exists
      Genre.findOne({ name: req.body.name }).exec(function (err, found_genre) {
        if (err) {
          return next(err);
        }
        if (found_genre) {
          // Genre exists, redirect to its detail page
          res.redirect(found_genre.url);
        } else {
          Genre.findByIdAndUpdate(
            req.params.id,
            genre,
            {},
            function (err, thegenre) {
              if (err) return next(err);
              res.redirect(thegenre.url);
            }
          );
        }
      });
    }
  },
];
