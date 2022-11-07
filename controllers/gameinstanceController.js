var GameInstance = require("../models/gameinstance");
var Game = require("../models/game");
var async = require("async");

//DONE

const { body, validationResult } = require("express-validator");

// Display list of all Gameinstances.
exports.gameinstance_list = function (req, res, next) {
  GameInstance.find()
    .populate("game")
    .exec(function (err, list_gameinstances) {
      if (err) {
        return next(err);
      }
      // Successful, so render.
      res.render("gameinstance_list", {
        title: "Game-Instance List",
        gameinstance_list: list_gameinstances,
      });
    });
};

// Display detail page for a specific Gameinstance.
exports.gameinstance_detail = function (req, res, next) {
  GameInstance.findById(req.params.id)
    .populate("game")
    .exec(function (err, gameinstance) {
      if (err) {
        return next(err);
      }
      if (gameinstance == null) {
        // No results.
        var err = new Error("Game copy not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("gameinstance_detail", {
        title: "Game:",
        gameinstance: gameinstance,
      });
    });
};

// Display GameInstance create form on GET.
exports.gameinstance_create_get = function (req, res, next) {
  Game.find({}, "title").exec(function (err, games) {
    if (err) {
      return next(err);
    }
    // Successful, so render.
    res.render("gameinstance_form", {
      title: "Create GameInstance",
      game_list: games,
    });
  });
};

// Handle GameInstance create on POST.
exports.gameinstance_create_post = [
  // Validate and sanitize fields.
  body("game", "Game must be specified").trim().isLength({ min: 1 }).escape(),
  //   body("imprint", "Imprint must be specified")
  //     .trim()
  //     .isLength({ min: 1 })
  //     .escape(),
  body("status").escape(),
  //   body("due_back", "Invalid date")
  //     .optional({ checkFalsy: true })
  //     .isISO8601()
  //     .toDate(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a GameInstance object with escaped and trimmed data.
    var gameinstance = new GameInstance({
      game: req.body.game,
      //   imprint: req.body.imprint,
      status: req.body.status,
      //   due_back: req.body.due_back,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values and error messages.
      Game.find({}, "title").exec(function (err, games) {
        if (err) {
          return next(err);
        }
        // Successful, so render.
        res.render("gameinstance_form", {
          title: "Create GameInstance",
          game_list: games,
          selected_game: gameinstance.game._id,
          errors: errors.array(),
          gameinstance: gameinstance,
        });
      });
      return;
    } else {
      // Data from form is valid
      gameinstance.save(function (err) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to new record.
        res.redirect(gameinstance.url);
      });
    }
  },
];

// Display GameInstance delete form on GET.
exports.gameinstance_delete_get = function (req, res, next) {
  GameInstance.findById(req.params.id)
    .populate("game")
    .exec(function (err, gameinstance) {
      if (err) {
        return next(err);
      }
      if (gameinstance == null) {
        // No results.
        res.redirect("/catalog/gameinstances");
      }
      // Successful, so render.
      res.render("gameinstance_delete", {
        title: "Delete GameInstance",
        gameinstance: gameinstance,
      });
    });
};

// Handle GameInstance delete on POST.
exports.gameinstance_delete_post = function (req, res, next) {
  // Assume valid GameInstance id in field.
  GameInstance.findByIdAndRemove(req.body.id, function deleteGameInstance(err) {
    if (err) {
      return next(err);
    }
    // Success, so redirect to list of GameInstance items.
    res.redirect("/catalog/gameinstances");
  });
};

// Display GameInstance update form on GET.
exports.gameinstance_update_get = function (req, res, next) {
  // Get game, authors and genres for form.
  async.parallel(
    {
      gameinstance: function (callback) {
        GameInstance.findById(req.params.id).populate("game").exec(callback);
      },
      games: function (callback) {
        Game.find(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.gameinstance == null) {
        // No results.
        var err = new Error("Game copy not found");
        err.status = 404;
        return next(err);
      }
      // Success.
      res.render("gameinstance_form", {
        title: "Update  GameInstance",
        game_list: results.games,
        selected_game: results.gameinstance.game._id,
        gameinstance: results.gameinstance,
      });
    }
  );
};

// Handle GameInstance update on POST.
exports.gameinstance_update_post = [
  // Validate and sanitize fields.
  body("game", "Game must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("due_back", "Invalid date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a GameInstance object with escaped/trimmed data and current id.
    var gameinstance = new GameInstance({
      game: req.body.game,
      //   imprint: req.body.imprint,
      status: req.body.status,
      //   due_back: req.body.due_back,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      // There are errors so render the form again, passing sanitized values and errors.
      Game.find({}, "title").exec(function (err, games) {
        if (err) {
          return next(err);
        }
        // Successful, so render.
        res.render("gameinstance_form", {
          title: "Update GameInstance",
          game_list: games,
          selected_game: gameinstance.game._id,
          errors: errors.array(),
          gameinstance: gameinstance,
        });
      });
      return;
    } else {
      // Data from form is valid.
      GameInstance.findByIdAndUpdate(
        req.params.id,
        gameinstance,
        {},
        function (err, thegameinstance) {
          if (err) {
            return next(err);
          }
          // Successful - redirect to detail page.
          res.redirect(thegameinstance.url);
        }
      );
    }
  },
];
