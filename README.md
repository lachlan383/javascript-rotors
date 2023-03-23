# javascript-rotors
A purely Javascript implementation of rotors from geometric algebra for full 3d rotation without quaternions. The simple approach to 3d rotation (euler angles) suffers from [gimbal lock](https://en.wikipedia.org/wiki/Gimbal_lock), preventing an object from rotating fully around each axis. The typical solution to this problem is to use 4-dimensional [quaternions](https://en.wikipedia.org/wiki/Quaternions_and_spatial_rotation) to encode 3d rotations, but this application of quaternions is extremely un-intuitive and esoteric. A better solution is to use the geometric algebra concepts of vectors, bivectors and rotors to encode 3d rotations, which has all the capabilities & performance of the quaternion method.

You can view the interactive implementation [here on JSFiddle](https://jsfiddle.net/djo45Lvg/).

## Footage

https://user-images.githubusercontent.com/48945096/227374637-6d287a5e-7a33-486a-a61d-d33097d559ae.mov

## Notes

This visualization and implementation is based on a post by [Marc ten Bosch](http://marctenbosch.com/quaternions/). Marc explains the theory extremely well, and provides some source code in C++. All Javascript in this project (except the two.js drawing library) are entirely my own work.
