// -*- mode: js; indent-tabs-mode: nil; js-basic-offset: 4 -*-
//
// This file is part of ThingEngine
//
// Copyright 2016-2018 The Board of Trustees of the Leland Stanford Junior University
//
// Author: Giovanni Campagna <gcampagn@cs.stanford.edu>
//
// See COPYING for details
"use strict";

const Q = require('q');
Q.longStackSupport = true;
process.on('unhandledRejection', (up) => { throw up; });

// require(thingpedia) to initialize the polyfill
require('thingpedia');

const assert = require('assert');

const Engine = require('../../lib/engine');

class MockAssistant {
    constructor() {
    }

    _setConversation(conv) {
        this._conv = conv;
    }

    getConversation(conv) {
        assert(conv === 'mock' || conv === undefined);
        return this._conv;
    }

    notifyAll(...data) {
        this._conv.notify(...data);
    }
    notifyErrorAll(...data) {
        this._conv.notifyError(...data);
    }
}

const THINGPEDIA_URL = 'https://almond-dev.stanford.edu/thingpedia';
const THINGENGINE_URL = 'https://almond-dev.stanford.edu';

async function runTests(engine, limitTo) {
    try {
        for (let x of ['devices', 'apps', 'database', 'http_client', 'builtins', 'permissions', 'remote', 'messaging', 'cloud_sync']) {
            if (limitTo !== undefined && x !== limitTo)
                continue;
            console.log(`Running ${x} tests`);
            await require('./test_' + x)(engine);
        }

        await engine.stop();
    } catch(e) {
        console.error('FAIL: ', e);
        process.exit(1);
    }
}

async function main() {
    const platform = require('./platform').newInstance();
    platform.setAssistant(new MockAssistant());

    const engine = new Engine(platform, {
        thingpediaUrl: THINGPEDIA_URL,
        cloudSyncUrl: THINGENGINE_URL
    });
    await engine.open();

    runTests(engine, process.argv[2]);
    await engine.run();

    await engine.close();
}
main();
