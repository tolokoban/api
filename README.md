# @tolokoban/api

Quick Typescript code generator for simple and robust RPC applications based
on a subset of REST protocol.

## Usage

Install it like this:

```bash
npm install --save-dev @tolokoban/api
```

Start it like this:

```bash
npx api config.json5
```

If you need help in creating an initial configuration file, just type:

```bash
npx api --init
```

## Motivation

When creating a RPC client/server application, we want to focus on the precise
definition of the server's API: the list of all the entry points.

All the boilerplate to exchange messages with format checking,
error handling and authentication is cumbersome and error prone.

## What do we mean by _subset of REST_?

Internally, we use REST to communicate between the client and the server.
Here is how we use it, but you don't really need to know this since __@tolokoban/api__
does all the abstraction for you.

* We use only POST queries.
* All the messages have the type `application/json`.
* HTTP status are used like this:
  * __200__: The query succedeed.
  * __400__: The format of the params received by the server don't match definition.
  * __401__: Authentication failed.
  * __500__: The procedure has been executed but returned an error.
* We use token authentication in the header.
