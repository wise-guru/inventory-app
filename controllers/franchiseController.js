const Franchise = require("../models/franchise");
const Game = require("../models/game");
const async = require("async");
const { body, validationResult } = require("express-validator");

//DONE

// Display list of all Franchise.
exports.franchise_list = function (req, res, next) {
  Franchise.find()
    .sort([["name", "ascending"]])
    .exec(function (err, list_franchises) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render("franchise_list", {
        title: "Franchise List",
        franchise_list: list_franchises,
      });
    });
};

// Display detail page for a specific Franchise.
exports.franchise_detail = (req, res, next) => {
  async.parallel(
    {
      franchise(callback) {
        Franchise.findById(req.params.id).exec(callback);
      },

      franchise_games(callback) {
        Game.find({ franchise: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.franchise == null) {
        // No results.
        const err = new Error("Franchise not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render
      res.render("franchise_detail", {
        title: "Franchise Detail",
        franchise: results.franchise,
        franchise_games: results.franchise_games,
      });
    }
  );
};

// Display Franchise create form on GET.
exports.franchise_create_get = (req, res, next) => {
  res.render("franchise_form", { title: "Create Franchise" });
};

// Handle Franchise create on POST.
exports.franchise_create_post = [
  // Validate and sanitize the name field.
  body("name", "Franchise name required").trim().isLength({ min: 1 }).escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a franchise object with escaped and trimmed data.
    const franchise = new Franchise({ name: req.body.name });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("franchise", {
        title: "Create Franchise",
        franchise,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if Franchise with same name already exists.
      Franchise.findOne({ name: req.body.name }).exec(
        (err, found_franchise) => {
          if (err) {
            return next(err);
          }

          if (found_franchise) {
            // Franchise exists, redirect to its detail page.
            res.redirect(found_franchise.url);
          } else {
            franchise.save((err) => {
              if (err) {
                return next(err);
              }
              // Franchise saved. Redirect to franchise detail page.
              res.redirect(franchise.url);
            });
          }
        }
      );
    }
  },
];

// Display Franchise delete form on GET.
exports.franchise_delete_get = function (req, res, next) {
  async.parallel(
    {
      franchise: function (callback) {
        Franchise.findById(req.params.id).exec(callback);
      },
      franchises_games: function (callback) {
        Game.find({ franchise: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.franchise == null) {
        // No results.
        res.redirect("/catalog/franchises");
      }
      // Successful, so render.
      res.render("franchise_delete", {
        title: "Delete Franchise",
        franchise: results.franchise,
        franchises_games: results.franchises_games,
      });
    }
  );
};

// Handle Franchise delete on POST.
exports.franchise_delete_post = function (req, res, next) {
  async.parallel(
    {
      franchise: function (callback) {
        Franchise.findById(req.body.franchiseid).exec(callback);
      },
      franchises_games: function (callback) {
        Game.find({ franchise: req.body.franchiseid }).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      // Success
      if (results.franchises_games.length > 0) {
        // Franchise has games. Render in same way as for GET route.
        res.render("franchise_delete", {
          title: "Delete Franchise",
          franchise: results.franchise,
          franchises_games: results.franchises_games,
        });
        return;
      } else {
        // Franchise has no games. Delete object and redirect to the landing page
        Franchise.findByIdAndRemove(
          req.body.franchiseid,
          function deleteFranchise(err) {
            if (err) {
              return next(err);
            }
            // Success - go to franchise list
            res.redirect("/catalog/franchises");
          }
        );
      }
    }
  );
};

// Display Franchise update form on GET.
exports.franchise_update_get = function (req, res, next) {
  async.parallel(
    {
      franchise: function (callback) {
        Franchise.findById(req.params.id).exec(callback);
      },
    },
    function (err, results) {
      if (err) return next(err);
      res.render("franchise_form", {
        title: "Update Franchise",
        franchise: results.franchise,
      });
    }
  );
};

// Handle Franchise update on POST.
exports.franchise_update_post = [
  // Validation and Sanitization
  body("name", "Franchise must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  // Process post validation and sanitization
  (req, res, next) => {
    const errors = validationResult(req);

    var franchise = new Franchise({
      title: req.body.title,
      name: req.body.name,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      async.parallel(
        {
          franchise: function (callback) {
            Franchise.findById(req.params.id).exec(callback);
          },
        },
        function (err, results) {
          if (err) return next(err);
          res.render("franchise", {
            title: "Update Franchise",
            franchise: results.franchise,
            errors: errors.array(),
          });
        }
      );
      return;
    } else {
      // Data from form is valid
      // Check if Franchise with same name already exists
      Franchise.findOne({ name: req.body.name }).exec(function (
        err,
        found_franchise
      ) {
        if (err) {
          return next(err);
        }
        if (found_franchise) {
          // Franchise exists, redirect to its detail page
          res.redirect(found_franchise.url);
        } else {
          Franchise.findByIdAndUpdate(
            req.params.id,
            franchise,
            {},
            function (err, thefranchise) {
              if (err) return next(err);
              res.redirect(thefranchise.url);
            }
          );
        }
      });
    }
  },
];
