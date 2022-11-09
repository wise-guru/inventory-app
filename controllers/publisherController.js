const Publisher = require("../models/publisher");
const async = require("async");
const Game = require("../models/game");
const { body, validationResult } = require("express-validator");

// Display list of all Publishers.
exports.publisher_list = (req, res, next) => {
  console.log(Publisher);
  Publisher.find()
    .sort([["name", "ascending"]])
    .exec(function (err, list_publishers) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render("publisher_list", {
        title: "Publisher List",
        publisher_list: list_publishers,
      });
    });
};

// Display detail page for a specific Publisher.
exports.publisher_detail = (req, res, next) => {
  async.parallel(
    {
      publisher(callback) {
        Publisher.findById(req.params.id).exec(callback);
      },
      publishers_games(callback) {
        Game.find({ publisher: req.params.id }, "title summary").exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        // Error in API usage.
        return next(err);
      }
      if (results.publisher == null) {
        // No results.
        const err = new Error("Publisher not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render("publisher_detail", {
        title: "Publisher Detail",
        publisher: results.publisher,
        publisher_games: results.publishers_games,
      });
    }
  );
};

// Display Publisher create form on GET.
exports.publisher_create_get = (req, res, next) => {
  res.render("publisher_form", { title: "Create Publisher", passcode: false });
};

// Handle Publisher create on POST.
exports.publisher_create_post = [
  // Validate and sanitize fields.
  body("company_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Company name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),
  body("founded_date", "Invalid founded date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  body("defunct_date", "Invalid defunct date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render("publisher_form", {
        title: "Create Publisher",
        publisher: req.body,
        passcode: false,
        errors: errors.array(),
      });
      return;
    }
    // Data from form is valid.

    // Create an Publisher object with escaped and trimmed data.
    const publisher = new Publisher({
      company_name: req.body.company_name,
      founded_date: req.body.founded_date,
      defunct_date: req.body.defunct_date,
    });
    publisher.save((err) => {
      if (err) {
        return next(err);
      }
      // Successful - redirect to new publisher record.
      res.redirect(publisher.url);
    });
  },
];

// Display Publisher delete form on GET.
exports.publisher_delete_get = (req, res, next) => {
  async.parallel(
    {
      publisher(callback) {
        Publisher.findById(req.params.id).exec(callback);
      },
      publishers_games(callback) {
        Game.find({ publisher: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.publisher == null) {
        // No results.
        res.redirect("/catalog/publishers");
      }
      // Successful, so render.
      res.render("publisher_delete", {
        title: "Delete Publisher",
        publisher: results.publisher,
        publisher_games: results.publishers_games,
      });
    }
  );
};

// Handle Publisher delete on POST.
exports.publisher_delete_post = (req, res, next) => {
  async.parallel(
    {
      publisher(callback) {
        Publisher.findById(req.body.publisherid).exec(callback);
      },
      publishers_games(callback) {
        Game.find({ publisher: req.body.publisherid }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      // Success
      if (results.publishers_games.length > 0) {
        // Publisher has books. Render in same way as for GET route.
        res.render("publisher_delete", {
          title: "Delete Publisher",
          publisher: results.publisher,
          publisher_games: results.publishers_games,
        });
        return;
      }
      if (req.body.passcode != process.env.ADMIN_PASSCODE) {
        return res.render("publisher_delete", {
          title: "Delete Publisher",
          publisher: results.publisher,
          publisher_games: results.publishers_games,
          passcodeError: "Wrong Passcode",
        });
      }
      // Publisher has no books. Delete object and redirect to the list of publishers.
      Publisher.findByIdAndRemove(req.body.publisherid, (err) => {
        if (err) {
          return next(err);
        }
        // Success - go to publisher list
        res.redirect("/catalog/publishers");
      });
    }
  );
};

// Display Publisher update form on GET
exports.publisher_update_get = function (req, res, next) {
  async.parallel(
    {
      publisher: function (callback) {
        Publisher.findById(req.params.id)
          // .populate("game")
          // .populate("genre")
          .exec(callback);
      },
    },
    function (err, results) {
      if (err) return next(err);
      if (results.publisher == null) {
        // No Results
        var err = new Error("Publisher not found");
        err.status = 404;
        return next(err);
      }

      res.render("publisher_form", {
        title: "Update Publisher",
        publisher: results.publisher,
        passcode: true,
      });
    }
  );
};

// Handle Publisher update on POST
exports.publisher_update_post = [
  // Validate and sanitize fields
  body("company_name", "Company name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("founded_date", "Invalid founded date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  body("defunct_date", "Invalid defunct date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  body("passcode").custom((value, { req }) => {
    if (req.body.passcode === process.env.ADMIN_PASSCODE) {
      return true;
    } else {
      throw new Error("Wrong password");
    }
  }),

  // Process request after validation and saniization
  (req, res, next) => {
    // Extract the validation errors from request
    const errors = validationResult(req);

    // Create an objet with escaped/trimmed data and old id
    var publisher = new Publisher({
      company_name: req.body.company_name,
      founded_date: req.body.founded_date,
      defunct_date: req.body.defunct_date,
      _id: req.params.id,
    });
    if (!errors.isEmpty()) {
      // There are errors. Render form again with Sanitized values

      // Get all publishers and genres for form
      res.render("publisher_form", {
        title: "Update Publisher",
        publisher: publisher,
        passcode: true,
        errors: errors.array(),
      });
      return;
    } else {
      Publisher.findByIdAndUpdate(
        req.params.id,
        publisher,
        {},
        function (err, thepublisher) {
          if (err) return next(err);

          res.redirect(thepublisher.url);
        }
      );
    }
  },
];
