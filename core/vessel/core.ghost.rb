#!/bin/env ruby
# encoding: utf-8

class VesselGhost # TODO

  include Vessel

  def initialize id = 0

    super

    @name = "A ghost"

    install(:default,:look)
    install(:default,:help)

  end

end