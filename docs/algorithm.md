[home](../README.md)/[algorithm](./algorithm.md)
# Algorithms and steps in codes
Find proper instructions of code as steps of instruction. I mapped out my thought process in making systems.

### Login setup
Steps involved for logging the user in the database.

#### Algorithm:
1. Get data sent by user from `req.body`.
0. Match the username/email.
0. Find the user:

    ```js
    if(!user) => throw new ApiError(400);
    ```

0. Next, if user exists then check password from the match method in `user` with the `password` we recieved from `req.body`

    ```ts
    const isPassowordCorrect: boolean = user.isPasswordCorrect(password);
    ```

0. Now, if password matches then generate access token and refresh token using the generator function.
0. Finally, send `cookie` back to the user as a `ApiResponse`.