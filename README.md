# scrabbler
Command-line Scrabble player and solver in JavaScript

This is a JavaScript implementation of ["The World's Fastest Scrabble Program"](https://www.cs.cmu.edu/afs/cs/academic/class/15451-s06/www/lectures/scrabble.pdf),
by Andrew W. Appel and Guy J. Jacobson. I followed their pseudocode closely to
implement the algorithm.

**This is very much a work-in-progress**, so do not expect it to work consistently. 
When it is stable, this readme will be updated with usage instructions and examples.

When stable, this tool can serve a few different purposes. It can be used by humans
to play Scrabble against each other at the command line. It can be used by a human to
play against a computer. It can be used to quickly simulate games between two computer
players. Perhaps most interestingly, it can be used to experiment with different 
strategies.

The algorithm generates all possible moves given a board and a rack of tiles. For
each possible move, I am calculating a few different pieces of information:
the points it would earn, the number of bonus squares it would use, etc (more to be
determined). We can then define a strategy as a function that chooses a single
move to play out of the list of all possible moves, based on this information.