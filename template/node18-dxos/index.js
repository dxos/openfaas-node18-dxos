// Copyright (c) Alex Ellis 2021. All rights reserved.
// Copyright (c) OpenFaaS Author(s) 2021. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

"use strict";

const express = require("express");
const app = express();
const handler = require("./function/dist/handler");
const bodyParser = require("body-parser");

// const { Client, Config, fromSocket } = require('@dxos/client');

const defaultMaxSize = "100kb"; // body-parser default

app.disable("x-powered-by");

const rawLimit = process.env.MAX_RAW_SIZE || defaultMaxSize;
const jsonLimit = process.env.MAX_JSON_SIZE || defaultMaxSize;

app.use(function addDefaultContentType(req, res, next) {
  // When no content-type is given, the body element is set to
  // nil, and has been a source of contention for new users.

  if (!req.headers["content-type"]) {
    req.headers["content-type"] = "text/plain";
  }
  next();
});

if (process.env.RAW_BODY === "true") {
  app.use(bodyParser.raw({ type: "*/*", limit: rawLimit }));
} else {
  app.use(bodyParser.text({ typre: "text/*" }));
  app.use(bodyParser.json({ limit: jsonLimit }));
  app.use(bodyParser.urlencoded({ extended: true }));
}

const isArray = (a) => {
  return !!a && a.constructor === Array;
};

const isObject = (a) => {
  return !!a && a.constructor === Object;
};

class FunctionEvent {
  constructor(req) {
    this.body = req.body;
    this.headers = req.headers;
    this.method = req.method;
    this.query = req.query;
    this.path = req.path;
  }
}

class FunctionContext {
  constructor(cb, client = undefined) {
    this.statusCode = 200;
    this.cb = cb;
    this.client = client;
    this.headerValues = {};
    this.cbCalled = 0;
  }

  status(statusCode) {
    if (!statusCode) {
      return this.statusCode;
    }

    this.statusCode = statusCode;
    return this;
  }

  headers(value) {
    if (!value) {
      return this.headerValues;
    }

    this.headerValues = value;
    return this;
  }

  succeed(value) {
    let err;
    this.cbCalled++;
    this.cb(err, value);
  }

  fail(value) {
    let message;
    if (this.status() == "200") {
      this.status(500);
    }

    this.cbCalled++;
    this.cb(value, message);
  }
}

const middleware = async (req, res) => {
  const cb = (err, functionResult) => {
    if (err) {
      console.error(err);
      return res
        .status(fnContext.status())
        .send(err.toString ? err.toString() : err);
    }

    if (isArray(functionResult) || isObject(functionResult)) {
      res
        .set(fnContext.headers())
        .status(fnContext.status())
        .send(JSON.stringify(functionResult));
    } else {
      res
        .set(fnContext.headers())
        .status(fnContext.status())
        .send(functionResult);
    }
  };

  try {
    const fnEvent = new FunctionEvent(req);
    console.log('invoking function:', JSON.stringify(fnEvent?.body));

    // TODO(burdon): Client config.
    // const clientUrl = fnEvent?.body?.context?.clientUrl; // TODO(burdon): clientSocket.
    // console.log('000', clientUrl);
    // const client = new Client({ config: new Config({}), services: fromSocket(clientUrl) });
    // console.log('111');
    // await client.initialize();

    // console.log('client initialized:', client);
    // const fnContext = new FunctionContext(cb, client);
    const fnContext = new FunctionContext(cb);
    console.log('222');
    const res = await handler(fnEvent, fnContext, cb);
    console.log('333');
    if (!fnContext.cbCalled) {
      fnContext.succeed(res);
    }

    // Promise.resolve(handler(fnEvent, fnContext, cb)).then((res) => {
    //   if (!fnContext.cbCalled) {
    //     fnContext.succeed(res);
    //   }
    // }).catch((e) => {
    //   cb(e);
    // });
  } catch (e) {
    cb(e);
  }
};

app.post("/*", middleware);
app.get("/*", middleware);
app.patch("/*", middleware);
app.put("/*", middleware);
app.delete("/*", middleware);
app.options("/*", middleware);

const port = process.env.http_port || 3000;

app.listen(port, () => {
  console.log(`node18 listening on port: ${port}`);
});
