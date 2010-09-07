# Features

Below are some of the main features of YARD.

## Yardoc Meta-tag Formatting

YARD uses a '@tag' style definition syntax (like Python, Java, Objective-C and other languages) 
for meta tags alongside regular code
documentation. These tags should be able to happily sit side by side RDoc formatted
documentation, but provide a much more consistent and usable way to describe
important information about objects, such as what parameters they take and what types
they are expected to be, what type amethod should return, what exceptions it can 
raise, if it is deprecated, etc.. It also allows information to be better (and more 
consistently) organizedduring the output generation phase. You can find a list
of tags in the [Tags.md](http://yardoc.org/docs/yard/file/docs/Tags.md#List_of_Available_Tags) file.

YARD also supports an optional "types" declarations for certain tags.
This allows the developer to document type signatures for ruby methods and
parameters in a non intrusive but helpful and consistent manner. Instead of
describing this data in the body of the description, a developer may formally
declare the parameter or return type(s) in a single line. Consider the
following Yardoc'd method:

     # Reverses the contents of a String or IO object. 
     # 
     # @param [String, #read] contents the contents to reverse 
     # @return [String] the contents reversed lexically 
     def reverse(contents) 
       contents = contents.read if respond_to? :read 
       contents.reverse 
     end
                                                                     
With the above @param tag, we learn that the contents parameter can either be
a String or any object that responds to the 'read' method, which is more
powerful than the textual description, which says it should be an IO object.
This also informs the developer that they should expect to receive a String
object returned by the method, and although this may be obvious for a
'reverse' method, it becomes very useful when the method name may not be as
descriptive.

## RDoc Formatting Compatibility

YARD is made to be compatiblewith RDoc formatting. In fact, YARD does no 
processing on RDoc documentationstrings, and leaves this up to the output 
generation tool to decide how to render the documentation.

## A Local Documentation Server

YARD can serve documentation for projects or installed gems (similar to 
`gem server`) with the added benefit of dynamic searching, as well as live 
reloading. Using the live reload feature, you can document your code and 
immediately preview the results by refreshing the page; YARD will do all the 
work in re-generating the HTML. This makes writing documentation a much 
faster process.

## Custom Constructs and Extensibility

YARD is designed to be extended and customized by plugins. Take for instance 
the scenario where you need to document the following code:
   
    # Sets the publisher name for the list.
    cattr_accessor :publisher
                                                                        
This custom declaration provides dynamically generated code that is hard for a
documentation tool to properly document without help from the developer. To
ease the pains of manually documenting the procedure, YARD can be extended by
the developer to handle the `cattr_accessor` construct and automatically create
an attribute on the class with the associated documentation. This makes
documenting external API's, especially dynamic ones, a lot more consistent for
consumption by the users.

YARD is also designed for extensibility everywhere else, allowing you to add
support for new programming languages, new data structures and even where/how
data is stored.

## Template Customization

YARD makes it easy to customize templates using a specially designed templating 
system. The design allows plugin developers to make small modifications to a
template without breaking changes that may have been made from another plugin.
This means you can install multiple plugins that each make independent modifications
without running into problems with your template. It also allows you to easily
make small changes (like adding your own stylesheets) without digging into
any markup.
                                                                              
## Raw Data Output

YARD also outputs documented objects as raw data (thedumped Namespace) which 
can be reloaded to do generation at a later date, oreven auditing on code. This 
means that any developer can use the raw data toperform output generation for 
any custom format, such as YAML, for instance.While YARD plans to support XHTML 
style documentation output as well ascommand line (text based) and possibly XML, 
this may still be useful for those who would like to reap the benefits of YARD's 
processing in other forms, suchas throwing all the documentation into a database.
Another useful way ofexploiting this raw data format would be to write tools 
that can auto generate test cases, for example, or show possible unhandled 
exceptions in code.

