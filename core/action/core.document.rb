#!/bin/env ruby
# encoding: utf-8

class ActionDocument

  include Action

  def initialize q = nil

    super

    @name = "Document"
    @docs = "Generate the Github documentation file."

  end

  def act q = nil
    
    content_actions = ""
    
    @host.actions.each do |cat,a|
      content_actions += "#{cat}\n"
      a.each do |action|
        action = action.new
        content_actions += "  #{action.name.append(' ',14)} | #{action.docs}\n"
      end
    end
    
    content = "# #{@host.name}
    
#{@host.docs}

## Available actions

```
#{content_actions}```

## Documentation

Generated with [Nataniev](http://wiki.xxiivv.com/Nataniev) on **#{Desamber.new}**, read the full [project documentation](#{@host.site}).

##License

See the [LICENSE](https://github.com/neauoire/License/README.md) file for license rights and limitations (CC)."

    # Create temp file
    out_file = File.new("#{@host.path}/README.md.tmp", "w")
    out_file.puts(content)
    out_file.close

    # Replace file
    File.rename("#{@host.path}/README.md.tmp", "#{@host.path}/README.md")

    return "\n===========================\n\n#{content}\n\n===========================\n\n"
    
  end

end