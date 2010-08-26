# Writing a Handler for Custom Ruby Syntax (DSL)

This guide will explain how to use YARD to document a Domain Specific Language (DSL) or custom Ruby syntax. The example implementations will focus on new-style handler API, which is only available under Ruby 1.9. If you are developing handlers for 1.8.x, there will be a few notes about the API differences.

## The Two Handler APIs (1.8 and 1.9)

YARD had adopted Ruby 1.9 as its main support platform very early on as a long-term investment into the future of Ruby's ecosystem. The main As more and more users are migrating to 1.9, this investment is paying off. YARD designed 

However, 1.8 usage is still widespread, and YARD still maintains support for Ruby versions back to 1.8.6. Therefore, the old handler syntax (which was used in YARD 0.2.x) is still available under the "Legacy" namespace (specifically, whenever you see a class name under `Handlers::Ruby`, you can find the 1.8 equivalent class in `Handlers::Ruby::Legacy`). We will see a few of the differences between these APIs later in this guide.

## A Hello World Handler

The most basic handler is implemented by inheriting from the [YARD::Handlers::Ruby::Base](http://yardoc.org/docs/yard/YARD/Handlers/Ruby/Base) class. By subclassing, our handler is immediately registered and is checked whenever a statement is parsed. The following is the most basic handler.

    class MyHandler < YARD::Handlers::Ruby::Base
      handles :class
      
      def process
        puts "Handling a class statement!"
      end
    end

This handler will tell us whenever a class is processed.
    
<span class="note">*Note: the `#process` method is equivalent to creating a `process do ... end` block.*</span>

### How Handlers Get Called

To understand how and when this handler is called, we must briefly explain how YARD processes source files. When a Ruby source file is parsed, it is done statement by statement. For each statement, YARD checks the list of registered handlers for all of the handlers that are set to "handle" the statement. Whichever handlers match will be called (by executing the `#process` method).

### Nodes and the AST

<span class="note api">This section applies only to the new-style handlers, not to the legacy API. The legacy API has no AST and deals only with statements as strings.</span>

Statements are passed into the `#process` method as an [Abstract Syntax Tree](http://en.wikipedia.org/wiki/Abstract_syntax_tree) (AST). Each node in the AST has a `#type` which uniquely identifies the node type. YARD uses Ripper to parse the AST, and therefore a full list of node types can be found by running `ruby -rripper -e 'puts Ripper::EVENTS'` or in irb:

    >> require 'ripper'
    => true
    >> Ripper::EVENTS
    => [:BEGIN, :END, :alias, :alias_error, :aref, :aref_field,
     :arg_ambiguous, :arg_paren, :args_add, :args_add_block, :args_add_star,
     :args_new, :array, :assign, :assign_error, :assoc_new,
     :assoclist_from_args, :bare_assoc_hash, :begin, :binary, :block_var,
     :block_var_add_block, :block_var_add_star, :blockarg, :bodystmt,
     :brace_block, :break, :call, :case, :class, :class_name_error, :command,
     :command_call, :const_path_field, :const_path_ref, :const_ref, :def,
     :defined, :defs, :do_block, :dot2, :dot3, :dyna_symbol, :else, :elsif,
     :ensure, :excessed_comma, :fcall, :field, :for, :hash, :if, :if_mod,
     :ifop, :lambda, :magic_comment, :massign, :method_add_arg,
     :method_add_block, :mlhs_add, :mlhs_add_star, :mlhs_new, :mlhs_paren,
     :module, :mrhs_add, :mrhs_add_star, :mrhs_new, :mrhs_new_from_args,
     :next, :opassign, :operator_ambiguous, :param_error, :params, :paren,
     :parse_error, :program, :qwords_add, :qwords_new, :redo, :regexp_add,
     :regexp_literal, :regexp_new, :rescue, :rescue_mod, :rest_param, :retry,
     :return, :return0, :sclass, :stmts_add, :stmts_new, :string_add,
     :string_concat, :string_content, :string_dvar, :string_embexpr,
     :string_literal, :super, :symbol, :symbol_literal, :top_const_field,
     :top_const_ref, :unary, :undef, :unless, :unless_mod, :until, :until_mod,
     :var_alias, :var_field, :var_ref, :void_stmt, :when, :while, :while_mod,
     :word_add, :word_new, :words_add, :words_new, :xstring_add,
     :xstring_literal, :xstring_new, :yield, :yield0, :zsuper, :CHAR,
     :__end__, :backref, :backtick, :comma, :comment, :const, :cvar, :embdoc,
     :embdoc_beg, :embdoc_end, :embexpr_beg, :embexpr_end, :embvar, :float,
     :gvar, :heredoc_beg, :heredoc_end, :ident, :ignored_nl, :int, :ivar, :kw,
     :label, :lbrace, :lbracket, :lparen, :nl, :op, :period, :qwords_beg,
     :rbrace, :rbracket, :regexp_beg, :regexp_end, :rparen, :semicolon, :sp,
     :symbeg, :tlambda, :tlambeg, :tstring_beg, :tstring_content,
     :tstring_end, :words_beg, :words_sep]
    
<span class="note warn">You should consult [Ripper documentation](http://yardoc.org/docs/ruby-stdlib/Ripper) on the meaning of each node type, though currently the documentation for these nodes is sparse.</span>

You do not need to know each node, just that there are many kinds of nodes to express the various Ruby statements. We will use these nodes to tell our handler what statement to match.

### Matchers

The [`handles`](http://yardoc.org/docs/yard/YARD/Handlers/Base#handles-class_method) statement above therefore describes to YARD which statements a handler should process. We call these "**matchers**", because they determine if the current statement matches the handler. 

The most basic matcher is a Symbol value that represents the node type of the statement. In our example above, we are looking for any statement which is represented by the `:class` node, also known as the "class" statement. A full list of nodes can be found in the Ripper documentation.

A handler can have multiple handles statements and multiple matchers in each statement. The following is also valid:

    class MyHandler < YARD::Handlers::Ruby::Base
      handles :class, :sclass
      handles :module
      
      def process; end
    end
    
The above handler would handle classes and modules.

<span class="note">*Note: `:sclass` is the node for `class << obj` blocks.* </span>

### Meta and Special Matchers

We discussed basic matchers based on a node type, but you can also create more complex custom matchers by subclassing the [HandlesExtension](http://yardoc.org/docs/YARD/Handlers/Ruby/HandlesExtension) class which responds to `#matches?`. YARD has a few of these matchers already available for common tasks, like matching method calls and conditionals.

Specifically, the new-style handlers provide the two matcher extensions [`method_call`](http://yardoc.org/docs/YARD/Handlers/Ruby/Base#method_call-class_method) and [`meta_type`](YARD/Handlers/Ruby/Base#meta_type-class_method). Which can be used in the form:
    
    handles method_call(:describe)
    
Which will match the method call `describe` in the forms:

    object.describe do ... end
    describe(foo)
    describe 'a', 'b', 'c'
    ...

You can also match all conditionals (if, unless, etc.) in one shot with:

    handles meta_type(:condition)
    
Which calls `#condition?` on the node. A full set of meta-types that can be tested for is found in the [AstNode](http://yardoc.org/docs/yard/YARD/Parser/Ruby/AstNode) class.

## Creating a Simple DSL Handler

Now that we have the basics out of the way, we can create our first handler for a DSL syntax. Let's say, for our example, that our framework has a method `cattr_accessor` that we want to document in our HTML documentation as class level read/write attributes. To show an example, we want to document this:

    class OurClass
      cattr_accessor :foo
    end
    
As if it were written like this:

    class OurClass
      class << self
        attr_accessor :foo
      end
    end

With YARD, it's quite simple. Here is our handler:

    class ClassAttributeHandler < YARD::Handlers::Ruby::AttributeHandler
      handles method_call(:cattr_accessor)
      namespace_only
      
      def process
        push_state(:scope => :class) { super }
      end
    end
    
<span class="note api">For legacy handlers your `handles` statement would match a regular expression in the form `/\Acattr_accessor\b/` since legacy handlers deal with statements as strings, not ASTs. We would also subclass the `Legacy::AttributeHandler`. The rest of the example should be equivalent.</span>

First we should note that we've subclassed the [AttributeHandler](http://yardoc.org/docs/yard/YARD/Handlers/Ruby/AttributeHandler) class to do most of the legwork in creating our actual attribute objects for us, since our DSL is basically an attribute but in the "class" scope. We then setup a matcher for the `cattr_accessor` method call (described above).

You'll now notice something we never discussed before, the [`namespace_only`](http://yardoc.org/docs/yard/YARD/Handlers/Base#namespace_only-class_method) method. This declaration tells our handler that we should only match method calls inside a namespace (class or module), not inside a method. This is not strictly necessary, but it avoids dealing with dynamic attributes and method calls that may not really be attribute declarations at all.

Our process method simply calls [`#push_state`](http://yardoc.org/docs/yard/YARD/Handlers/Base#push_state-instance_method) to set our scope to "class" level before calling super and running the `AttributeHandler`'s process method. This basically makes our `AttributeHandler` class run inside the class level and create attributes on our class rather than as instance methods.
    
## Creating and Modifying Objects in a Handler and Processing Blocks

We just saw a very simple handler that didn't do very much manipulation or object creation. Often, however, the purpose of a handler is to create a new [`CodeObject`](http://yardoc.org/docs/yard/YARD/CodeObjects/Base) or modify an existing one. To illustrate how to create and manipulate these code objects in YARD, let's look at a very simple DSL that creates new method objects that we'd want to document. Our DSL would create instance methods using the function "methodify":

    class SomeClass
      methodify "foo" do
        raise NotImplementedError
      end
    end
    
In the above example, we'd want to document "foo" as an instance method inside of "SomeClass". This time we will not subclass an existing handler, but rather we will create the method object ourselves. Let's look at the handler code to achieve this.

    class MethodifyHandler < YARD::Handlers::Ruby::Base
      handles method_call(:methodify)
      namespace_only
      
      def process
        name = statement.parameters.first.jump(:tstring_content, :ident).source
        object = YARD::CodeObjects::MethodObject.new(namespace, name)
        register(object)
        parse_block(statement.last.last, :owner => object)
        
        # modify the object 
        object.dynamic = true 
        
        # add custom metadata to the object
        object['custom_field'] = 'Generated by Methodify'
      end
    end
    
From the previous example you should already be familiar with the first few lines of this handler. We are matching a method call for "methodify" inside a namespace.

The process method is where it all gets interesting. On the first line of the method you will see that we access the `statement` object, which pertains to the root node of our current statement. Because our statement is a method call, we are dealing with a [`MethodCallNode`](http://yardoc.org/docs/yard/YARD/Parser/Ruby/MethodCallNode) which has a list of parameters. We then take the first parameter and "jump" inside the string's quotes and get the inner text, which will become our method name. The next line creates our `MethodObject` by name in our current "namespace" (the current lexical module/class).

Now we need to [`#register`](http://yardoc.org/docs/yard/YARD/Handlers/Base#register-instance_method) the object. This method is not strictly necessary, but is a helper method in handlers used to add common attributes to an object, like line range for the source code, file name the object is located in, source language, and other attributes.

We then parse the block (the inside of the method). YARD by default does not parse statements inside a block unless told to do so with this method. Again, it not strictly necessary, but it allows YARD to run handlers for statements inside of our method (like generating a tag for that "raise" method). The [`#parse_block`](http://yardoc.org/docs/yard/YARD/Handlers/Ruby/Base#parse_block-instance_method) method does this for us, and takes two parameters: the node with the block and any extra state information to push while inside the block (similar to the `push_state` method we saw before). `statement.last.last` is the list of statements inside our block. For our state, we use `:owner` to specify that we are inside of the "foo" method. We use `:owner` instead of `:namespace` because a method is not a namespace. To clarify, `:owner` is a special state object to keep track of a lexical position inside non-namespace objects like methods. The distinction between an owner and a namespace is important because of Ruby's name resolution rules (it must always know what "namespace" it is inside of).

<span class="note ast">The `#parse_block` method in the legacy handler API takes only the state information, no block node is passed. This is because the legacy API has a `statement.block` method for every statement, which it checks before parsing.</span>

After we parsed the method contents, we set some more data on our new object. Neither of these are necessary, they are just here to illustrate that we can modify our object after it's been created. First we make it "dynamic", because it was generated dynamically (just as a note to the user). We then create a custom field on our object that will store a little notice that the method was created with our DSL. We could utilize this information later in a custom theme, if we wanted.

## Running Our Handlers in YARD

We talked about how to implement handlers, but you may still be wondering where this Ruby code goes and how we call on it. There are a few ways to answer this question, but in both cases we would create a separate source .rb file with our handler and other extension code, and load it in our runtime. A good place to put extensions is in a `yard_extensions.rb` file in the root of the project, or create a separate directory for these files.

If you're running inside of a Rake task, we need only to `require` our Ruby source file and have the handlers loaded into the runtime. The top of your `Rakefile` would look like:

    require 'yard'
    require File.dirname(__FILE__) + '/yard_extensions'

If you're running the `yardoc` tool from the command line, there is a -e (--load) command-line switch to load a Ruby file before parsing source. In this case, you would use the command:

    yardoc -e yard_extensions.rb 'lib/**/*.rb'

You can also create a plugin that is installed in your gem library and automatically loaded by YARD.