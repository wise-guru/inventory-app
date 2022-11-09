const express = require("express");
const router = express.Router();

// Require controller modules.
const game_controller = require("../controllers/gameController");
const publisher_controller = require("../controllers/publisherController");
const franchise_controller = require("../controllers/franchiseController");
const genre_controller = require("../controllers/genreController");
const game_instance_controller = require("../controllers/gameinstanceController");

/// Game ROUTES ///

// GET catalog home page.
router.get("/", game_controller.index);

// GET request for creating a Game. NOTE This must come before routes that display Game (uses id).
router.get("/game/create", game_controller.game_create_get);

// POST request for creating Game.
router.post("/game/create", game_controller.game_create_post);

// GET request to delete Game.
router.get("/game/:id/delete", game_controller.game_delete_get);

// POST request to delete Game.
router.post("/game/:id/delete", game_controller.game_delete_post);

// GET request to update Game.
router.get("/game/:id/update", game_controller.game_update_get);

// POST request to update Game.
router.post("/game/:id/update", game_controller.game_update_post);

// GET request for one Game.
router.get("/game/:id", game_controller.game_detail);

// GET request for list of all Game items.
router.get("/games", game_controller.game_list);

/// AUTHOR ROUTES ///

// GET request for creating Author. NOTE This must come before route for id (i.e. display author).
router.get("/publisher/create", publisher_controller.publisher_create_get);

// POST request for creating Author.
router.post("/publisher/create", publisher_controller.publisher_create_post);

// GET request to delete Author.
router.get("/publisher/:id/delete", publisher_controller.publisher_delete_get);

// POST request to delete Author.
router.post(
  "/publisher/:id/delete",
  publisher_controller.publisher_delete_post
);

// GET request to update Author.
router.get("/publisher/:id/update", publisher_controller.publisher_update_get);

// POST request to update Author.
router.post(
  "/publisher/:id/update",
  publisher_controller.publisher_update_post
);

// GET request for one Author.
router.get("/publisher/:id", publisher_controller.publisher_detail);

// GET request for list of all Authors.
router.get("/publishers", publisher_controller.publisher_list);

/// FRANCHISE ROUTES ///
// GET request for creating a Franchise. NOTE This must come before route that displays Franchise (uses id).
router.get("/franchise/create", franchise_controller.franchise_create_get);

//POST request for creating Franchise.
router.post("/franchise/create", franchise_controller.franchise_create_post);

// GET request to delete Franchise.
router.get("/franchise/:id/delete", franchise_controller.franchise_delete_get);

// POST request to delete Franchise.
router.post(
  "/franchise/:id/delete",
  franchise_controller.franchise_delete_post
);

// GET request to update Franchise.
router.get("/franchise/:id/update", franchise_controller.franchise_update_get);

// POST request to update Franchise.
router.post(
  "/franchise/:id/update",
  franchise_controller.franchise_update_post
);

// GET request for one Franchise.
router.get("/franchise/:id", franchise_controller.franchise_detail);

// GET request for list of all Franchise.
router.get("/franchises", franchise_controller.franchise_list);

/// GENRE ROUTES ///

// GET request for creating a Genre. NOTE This must come before route that displays Genre (uses id).
router.get("/genre/create", genre_controller.genre_create_get);

//POST request for creating Genre.
router.post("/genre/create", genre_controller.genre_create_post);

// GET request to delete Genre.
router.get("/genre/:id/delete", genre_controller.genre_delete_get);

// POST request to delete Genre.
router.post("/genre/:id/delete", genre_controller.genre_delete_post);

// GET request to update Genre.
router.get("/genre/:id/update", genre_controller.genre_update_get);

// POST request to update Genre.
router.post("/genre/:id/update", genre_controller.genre_update_post);

// GET request for one Genre.
router.get("/genre/:id", genre_controller.genre_detail);

// GET request for list of all Genre.
router.get("/genres", genre_controller.genre_list);

/// GameINSTANCE ROUTES ///

// GET request for creating a GameInstance. NOTE This must come before route that displays GameInstance (uses id).
router.get(
  "/gameinstance/create",
  game_instance_controller.gameinstance_create_get
);

// POST request for creating GameInstance.
router.post(
  "/gameinstance/create",
  game_instance_controller.gameinstance_create_post
);

// GET request to delete GameInstance.
router.get(
  "/gameinstance/:id/delete",
  game_instance_controller.gameinstance_delete_get
);

// POST request to delete GameInstance.
router.post(
  "/gameinstance/:id/delete",
  game_instance_controller.gameinstance_delete_post
);

// GET request to update GameInstance.
router.get(
  "/gameinstance/:id/update",
  game_instance_controller.gameinstance_update_get
);

// POST request to update GameInstance.
router.post(
  "/gameinstance/:id/update",
  game_instance_controller.gameinstance_update_post
);

// GET request for one GameInstance.
router.get("/gameinstance/:id", game_instance_controller.gameinstance_detail);

// GET request for list of all GameInstance.
router.get("/gameinstances", game_instance_controller.gameinstance_list);

module.exports = router;
