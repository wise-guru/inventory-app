const Publisher = require("../models/publisher");
const async = require("async");
const Game = require("../models/game");
const { body, validationResult } = require("express-validator");

//DONE?

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

// // Display detail page for a specific Author.
// exports.author_detail = (req, res, next) => {
//   async.parallel(
//     {
//       author(callback) {
//         Author.findById(req.params.id).exec(callback);
//       },
//       authors_books(callback) {
//         Book.find({ author: req.params.id }, "title summary").exec(callback);
//       },
//     },
//     (err, results) => {
//       if (err) {
//         // Error in API usage.
//         return next(err);
//       }
//       if (results.author == null) {
//         // No results.
//         const err = new Error("Author not found");
//         err.status = 404;
//         return next(err);
//       }
//       // Successful, so render.
//       res.render("author_detail", {
//         title: "Author Detail",
//         author: results.author,
//         author_books: results.authors_books,
//       });
//     }
//   );
// };

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
  res.render("publisher_form", { title: "Create Publisher" });
};

// Handle Publisher create on POST.
exports.publisher_create_post = [
  // Validate and sanitize fields.
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),
  body("family_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Family name must be specified.")
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters."),
  body("date_of_birth", "Invalid date of birth")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  body("date_of_death", "Invalid date of death")
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
        errors: errors.array(),
      });
      return;
    }
    // Data from form is valid.

    // Create an Publisher object with escaped and trimmed data.
    const publisher = new Publisher({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
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
          // .populate("book")
          // .populate("genre")
          .exec(callback);
      },
      // books: function (callback) {
      //   Book.find(callback);
      // },
      // genres: function (callback) {
      //   genre.find(callback);
      // },
    },
    function (err, results) {
      if (err) return next(err);
      if (results.publisher == null) {
        // No Results
        var err = new Error("Publisher not found");
        err.status = 404;
        return next(err);
      }

      console.log(results.publisher.date_of_birth_GET);
      res.render("publisher_form", {
        title: "Update Publisher",
        publisher: results.publisher,
      });
    }
  );
};

// Handle Publisher update on POST
exports.publisher_update_post = [
  // Validate and sanitize fields
  body("first_name", "First Name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("family_name", "Family Name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("date_of_birth", "Date of Birth must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  // body("date_of_death", "Date of Death must not be empty.")
  //   .trim()
  //   .isLength({ min: 1 })
  //   .escape(),

  // Process request after validation and saniization
  (req, res, next) => {
    // Extract the validation errors from request
    const errors = validationResult(req);

    // Create an objet with escaped/trimmed data and old id
    var publisher = new Publisher({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
      _id: req.params.id,
    });
    if (!errors.isEmpty()) {
      // There are errors. Render form again with Sanitized values

      // Get all publishers and genres for form
      res.render("publisher_form", {
        title: "Update Publisher",
        publisher: publisher,
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
