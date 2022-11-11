#! /usr/bin/env node

console.log(
  "This script populates some test books, auth0rs, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true"
);

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
  if (!userArgs[0].startsWith('mongodb')) {
      console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
      return
  }
  */
var async = require("async");
var Game = require("./models/game"); //replace b00k
var Publisher = require("./models/publisher"); //replace auth0r
var Franchise = require("./models/franchise");
var Genre = require("./models/genre");
var GameInstance = require("./models/gameinstance");

var mongoose = require("mongoose");
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

var publishers = [];
var genres = [];
var games = [];
var gameinstances = [];
var franchises = [];

function publisherCreate(company_name, founded_date, defunct_date, cb) {
  publisherdetail = { company_name: company_name };
  if (founded_date != false) publisherdetail.founded_date = founded_date;
  if (defunct_date != false) publisherdetail.defunct_date = defunct_date;

  var publisher = new Publisher(publisherdetail);

  publisher.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("new Publisher: " + publisher);
    publishers.push(publisher);
    cb(null, publisher);
  });
}

function genreCreate(name, cb) {
  var genre = new Genre({ name: name });

  genre.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Genre: " + genre);
    genres.push(genre);
    cb(null, genre);
  });
}

function franchiseCreate(name, cb) {
  var franchise = new Franchise({ name: name });

  franchise.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Franchise " + franchise);
    franchises.push(franchise);
    cb(null, franchise);
  });
}

function gameCreate(title, summary, image, publisher, genre, franchise, cb) {
  gamedetail = {
    title: title,
    summary: summary,
    image: image,
    publisher: publisher,
    // id: id,
  };
  if (genre != false) gamedetail.genre = genre;
  if (franchise != false) gamedetail.franchise = franchise;

  var game = new Game(gamedetail);

  game.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Game: " + game);
    games.push(game);
    cb(null, game);
  });
}

function gameInstanceCreate(game, status, cb) {
  gameinstancedetail = {
    game: game,
    // imprint: imprint,
  };
  //   if (due_back != false) gameinstancedetail.due_back = due_back;
  if (status != false) gameinstancedetail.status = status;

  var gameinstance = new GameInstance(gameinstancedetail);
  gameinstance.save(function (err) {
    if (err) {
      console.log("ERROR CREATING GameInstance: " + gameinstance);
      cb(err, null);
      return;
    }
    console.log("New GameInstance: " + gameinstance);
    gameinstances.push(gameinstance);
    cb(null, game);
  });
}

function createGenreFranchisesPublishers(cb) {
  async.series(
    [
      //--------Populating Publishers------------//
      function (callback) {
        publisherCreate("Innersloth", "2015", false, callback);
      },
      function (callback) {
        publisherCreate("Square Enix", "2003", false, callback);
      },
      function (callback) {
        publisherCreate("Nintendo", "1889", false, callback);
      },
      function (callback) {
        publisherCreate("Rockstar Games", "1998", false, callback);
      },
      function (callback) {
        publisherCreate("CD Projekt", "1994", false, callback);
      },
      function (callback) {
        publisherCreate("Sony", false, false, callback);
      },

      //----------Populating genres------------/
      function (callback) {
        genreCreate("Action", callback);
      },
      function (callback) {
        genreCreate("Adventure", callback);
      },
      function (callback) {
        genreCreate("Role-playing", callback);
      },
      function (callback) {
        genreCreate("Party", callback);
      },
      //-------------Populating franchises-----------/
      function (callback) {
        franchiseCreate("Life is Strange", callback);
      },
      function (callback) {
        franchiseCreate("Legend of Zelda", callback);
      },
      function (callback) {
        franchiseCreate("Grand Theft Auto", callback);
      },
      function (callback) {
        franchiseCreate("The Witcher", callback);
      },
    ],
    // optional callback
    cb
  );
}

// function createFranchises(cb) {
//   async.parallel([
//     function (callback) {
//       franchiseCreate("Life is Strange", callback);
//     },
//     function (callback) {
//       franchiseCreate("Legend of Zelda", callback);
//     },
//     function (callback) {
//       franchiseCreate("Grand Theft Auto", callback);
//     },
//     function (callback) {
//       franchiseCreate("The Witcher", callback);
//     },
//   ]);
// }

function createGames(cb) {
  async.parallel(
    [
      function (callback) {
        gameCreate(
          "Among Us",
          "Among Us is a party game of teamwork and betrayal. Crewmates work together to complete tasks before one or more Impostors can kill everyone aboard.",
          "1668205110787.jpg",
          publishers[5],
          [genres[4]],
          franchises[4],
          callback
        );
      },

      function (callback) {
        gameCreate(
          "Stardew Valley",
          "Stardew Valley is an open-ended country-life RPG! You’ve inherited your grandfather’s old farm plot in Stardew Valley. Armed with hand-me-down tools and a few coins, you set out to begin your new life. Can you learn to live off the land and turn these overgrown fields into a thriving home?",
          "1668205694693.jpeg",
          publishers[6],
          [genres[3]],
          franchises[5],
          callback
        );
      },
      function (callback) {
        gameCreate(
          "Assassin's Creed",
          "The setting is 1191 AD. The Third Crusade is tearing the Holy Land apart. You, Altair, intend to stop the hostilities by suppressing both sides of the conflict. You are an Assassin, a warrior shrouded in secrecy and feared for your ruthlessness. Your actions can throw your immediate environment into chaos, and your existence will shape events during this pivotal moment in history.",
          "1668207139086.jpg",
          publishers[7],
          [genres[3]],
          franchises[6],
          callback
        );
      },
      function (callback) {
        gameCreate(
          "Assassin's Creed 2",
          "The game's plot is set in the 21st century and follows Desmond Miles as he relives the genetic memories of his ancestor, Ezio Auditore da Firenze, to uncover the mysteries left behind by an ancient race known as the First Civilization in the hope of ending the Assassin-Templar conflict.",
          "1668207510682.jpeg",
          publishers[7],
          [genres[3]],
          franchises[6],
          callback
        );
      },
      function (callback) {
        gameCreate(
          "Life is Strange",
          "The plot focuses on Max Caulfield, an 18-year-old photography student who discovers that she has the ability to rewind time at any moment, leading her every choice to enact the butterfly effect.",
          "1667714488673.png",
          publishers[0],
          [genres[0]],
          franchises[0],
          callback
        );
      },
      function (callback) {
        gameCreate(
          "Life is Strange: Before the Storm",
          "Life is Strange: Before the Storm features Chloe Price a 16 year-old rebel who forms an unlikely friendship with Rachel Amber, a beautiful and popular girl destined for success. When Rachel's world is turned upside down by a family secret it takes their new found alliance to give each other the strength to overcome their demons.",
          "1667714600618.jpg",
          publishers[0],
          [genres[0]],
          franchises[0],
          callback
        );
      },
      function (callback) {
        gameCreate(
          "Life is Strange 2",
          "After a tragic incident, brothers Sean and Daniel Diaz run away from home. Fearing the police, and dealing with Daniel's new telekinetic power - the power to move objects with your mind - the boys flee to Mexico for safety.",
          "1667714549705.jpg",
          publishers[0],
          [genres[0]],
          franchises[0],
          callback
        );
      },
      function (callback) {
        gameCreate(
          "Life is Strange: True Colors",
          "The plot focuses on Alex Chen, a young woman who can experience the emotions of others, as she tries to solve the mystery behind a tragedy that happened in her life.",
          "1667714627144.png",
          publishers[0],
          [genres[0]],
          franchises[0],
          callback
        );
      },
      function (callback) {
        gameCreate(
          "Legend of Zelda: Twilight Princess",
          "The story focuses on series protagonist Link, who tries to prevent Hyrule from being engulfed by a corrupted parallel dimension known as the Twilight Realm. To do so, he takes the form of both a Hylian and a wolf, and he is assisted by a mysterious creature named Midna.",
          "1667714455697.jpg",
          publishers[1],
          [genres[1], genres[2]],
          franchises[1],
          callback
        );
      },
      function (callback) {
        gameCreate(
          "Legend of Zelda: Skyward Sword",
          "Taking the role of series protagonist Link, players navigate the floating island of Skyloft and the land below it, completing quests that advance the story and solving environmental and dungeon-based puzzles.",
          "1667714425051.png",
          publishers[1],
          [genres[1], genres[2]],
          franchises[1],
          callback
        );
      },
      function (callback) {
        gameCreate(
          "Legend of Zelda: Majora's Mask",
          "In this shadowy tale, a masked Skull Kid drags Link into the world of Termina, where the moon is falling from the sky.",
          "1667713577009.webp",
          publishers[1],
          [genres[1], genres[2]],
          franchises[1],
          callback
        );
      },
      function (callback) {
        gameCreate(
          "Grand Theft Auto IV",
          "What does the American Dream mean today? For Niko Bellic, fresh off the boat from Europe, it is the hope he can escape his past.",
          "1667708557222.jpg",
          publishers[2],
          [genres[1], genres[2]],
          franchises[2],
          callback
        );
      },
      function (callback) {
        gameCreate(
          "Grand Theft Auto V",
          "Set within the fictional state of San Andreas, based on Southern California, the single-player story follows three protagonists—retired bank robber Michael De Santa, street gangster Franklin Clinton, and drug dealer and gunrunner Trevor Philips—and their attempts to commit heists while under pressure from a corrupt government agency and powerful criminals.",
          "1667707834707.jpeg",
          publishers[2],
          [genres[1], genres[2]],
          franchises[2],
          callback
        );
      },
      function (callback) {
        gameCreate(
          "The Witcher",
          "Based on the fantasy novel series, The Witcher is centered around Geralt of Rivia, a legendary monster slayer caught in a web of intrigue woven by forces vying for control of the world.",
          "1667714666609.jpg",
          publishers[3],
          [genres[1], genres[3]],
          franchises[3],
          callback
        );
      },
      function (callback) {
        gameCreate(
          "The Witcher 3",
          "Players control Geralt of Rivia, a monster slayer for hire known as a Witcher, and search for his adopted daughter, who is on the run from the otherworldly Wild Hunt.",
          "1667714755919.jpg",
          publishers[3],
          [genres[1], genres[3]],
          franchises[3],
          callback
        );
      },
      //   function (callback) {
      //     gameCreate(
      //       "Life is Strange",
      //       "",
      //       //   "9781473211896",
      //       publishers[0],
      //       [genres[0]],
      //       callback
      //     );
      //   },
    ],
    // optional callback
    cb
  );
}

function createGameInstances(cb) {
  async.parallel(
    [
      function (callback) {
        gameInstanceCreate(
          games[0],
          //   "London Gollancz, 2014.",
          //   false,
          "Available",
          callback
        );
      },
      function (callback) {
        gameInstanceCreate(
          games[1],
          //   " Gollancz, 2011.",
          //   false,
          "Sold",
          callback
        );
      },
      function (callback) {
        gameInstanceCreate(
          games[2],
          //   " Gollancz, 2015.",
          //   false,
          false,
          callback
        );
      },
      function (callback) {
        gameInstanceCreate(
          games[3],
          //   "New York Tom Doherty Associates, 2016.",
          //   false,
          "Available",
          callback
        );
      },
      function (callback) {
        gameInstanceCreate(
          games[4],
          //   "New York Tom Doherty Associates, 2016.",
          //   false,
          "Available",
          callback
        );
      },
      function (callback) {
        gameInstanceCreate(
          games[5],
          //   "New York Tom Doherty Associates, 2016.",
          //   false,
          "Available",
          callback
        );
      },
      function (callback) {
        gameInstanceCreate(
          games[6],
          //   "New York, NY Tom Doherty Associates, LLC, 2015.",
          //   false,
          "Available",
          callback
        );
      },
      function (callback) {
        gameInstanceCreate(
          games[7],
          //   "New York, NY Tom Doherty Associates, LLC, 2015.",
          //   false,
          "Sold",
          callback
        );
      },
      function (callback) {
        gameInstanceCreate(
          games[8],
          //   "New York, NY Tom Doherty Associates, LLC, 2015.",
          //   false,
          "Available",
          callback
        );
      },
      function (callback) {
        gameInstanceCreate(games[9], "Sold", callback);
      },
      function (callback) {
        gameInstanceCreate(games[10], "Available", callback);
      },
      function (callback) {
        gameInstanceCreate(games[3], "Sold", callback);
      },
      function (callback) {
        gameInstanceCreate(games[5], "Sold", callback);
      },
      //   function (callback) {
      //     gameInstanceCreate(games[], "Imprint XXX3", false, false, callback);
      //   },
    ],
    // Optional callback
    cb
  );
  console.log(`Yee Yee ${publishers}`);
}

async.series(
  [createGenreFranchisesPublishers, createGames, createGameInstances],
  // Optional callback
  function (err, results) {
    if (err) {
      console.log("FINAL ERR: " + err);
    } else {
      console.log("GameInstances: " + gameinstances);
    }
    // All done, disconnect from database
    mongoose.connection.close();
  }
);
