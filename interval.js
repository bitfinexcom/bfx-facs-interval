'use strict'

const _ = require('lodash')
const async = require('async')
const Base = require('@bitfinex/bfx-facs-base')

class Intervals extends Base {
  constructor (caller, opts, ctx) {
    super(caller, opts, ctx)

    this.name = 'intervals'

    this.init()
  }

  init () {
    this.mem = new Map()
  }

  add (k, f, w) {
    if (w > Math.pow(2, 31) - 1) {
      return false
    }
    this.mem.set(k, setInterval(() => {
      if (!this.caller.active) return
      f()
    }, w))
    return true
  }

  del (k) {
    const itv = this.mem.get(k)
    clearInterval(itv)
    this.mem.delete(k)
  }

  _stop (cb) {
    async.series([
      next => { super._stop(next) },
      next => {
        _.each(Array.from(this.mem.keys()), k => this.del(k))
        next()
      }
    ], cb)
  }
}

module.exports = Intervals
