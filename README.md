# Browser Games

## Description

Browser games is a repo of games in various tecnologies:

- `Snaek: The snake` and `Maze` were made a long time ago (around 2013) with KinetikJS.
- `Maze 3D` and `Maze 3D GoT` were made around 2015 with Unity 5 and I updated them to Unity 2018.1 to be able to export to webGL. I couldn't update them to a newer version of Unity because UnityScript was deprecated in favor of c# but the migrating script didn't work for me. The two of them are basically the same game but with a flag changed.

I adapted them to the new technologies (Express and node) and made a few (very few) adjustments. The idea is that at some point in the future this repo will grow (or not). By now the games are only four games:

### Snaek: The snake

It's a game based on the popular snake game but with some more things (more items, enemies, bosses, a story...). The game has a story menu that it has 2 whole chapters, after this there is no more content. Only the story and the library options were implemented (hence the `Beta` label) but the story is long and difficult (even in the easy mode) enough to be playable for a little while.

### Maze

This is a basic labyrinth/maze game where you have to get to the exit the fastest you can. You can modify the height and width of the maze and the scattering (More scattering means shorter mazes but with more paths). You can also select random scattering and a value between 15 and 60 will be selected for you. The game saves your best time for the parameters selecteds.

### Maze 3D

The same idea that the `Maze` but in a 3D environment. You can move the ball with the arrow keys.

### Maze 3D GoT

A variant of the `Maze 3D` with a intro likewise the one in Game of Thrones

## Try it!

You can see a live example at this [Live Server](https://browser-games.onrender.com/) or you can run it locally.To run locally download the project in a Zip file or clone the repo and run:

```
npm install
npm start
```

And visit `http://localhost:3000` on your browser.
