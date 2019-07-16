---
title: 'Simple template transformer'
date: '2019-06-11'
published: true
layout: post
tags: ['template', 'transform', 'javascript', 'ruby']
category: 'work'
---

A simple template transformer demonstrating the concept being used in many template engines like `erb`, `ejs`, `pug` etc. Even though this gist doesn't dive as deep. It is still somewhat helpful in giving an idea of how these things work. It supports the basic js schema like if statements, for loops, switch statements for a bit complex templating. Also nested variables/keys.

```js
const TransformTemplate = function(html, options) {
  let literalIdentifier = /{{([^}}]+)?}}/g,
      keywordIdentifier = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g,
      code = 'var r=[];\n',
      cursor = 0,
      match;

  const add = function(line, js) {
    js ? (code += line.match(keywordIdentifier) ? `${line}\n` : 'r.push(' + line + ');\n') :
         (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
    return add;
  }

  while (match = literalIdentifier.exec(html)) {
    add(html.slice(cursor, match.index))(match[1], true);
    cursor = match.index + match[0].length;
  }

  add(html.substr(cursor, html.length - cursor));
  code += 'return r.join("");';
  return new Function(code.replace(/[\r\t\n]/g, '')).apply(options);
}

const template = "<p>Hello, my name is {{ this.name }}. I'm {{ this.profile.age }} years old.</p>";

TransformTemplate(template, {
  name: 'Pavan Prakash',
  profile: { age: 28 }
})
```

You can also return
```js
return new Function(' with (this) { '+code.replace(/[\r\t\n]/g, '')+'}').apply(options);
```
instead to remove the `this` from your literal identifiers. But remember that Douglas will [hate](https://yuiblog.com/blog/2006/04/11/with-statement-considered-harmful/) you.

If you want a ruby implementation, `mote` is a good place to start. It is extremely light-weight and I believe scales as well. However if you want a lean implementation of that, here it goes.

```ruby
class Template
  LITERAL_IDENTIFIER = /^\s*(%)(.*?)$/

  def self.transform(template, vars = '')
    lines = File.read(template).split("\n")

    func = "Proc.new do |#{vars}| \n output = \"\" \n "

    lines.each do |line|
        if line =~ LITERAL_IDENTIFIER
          func << " #{line.gsub(LITERAL_IDENTIFIER, '\1') } \n"
        else
          func << " output << \" #{line.gsub(/\{\{([^\r\n\{]*)\}\}/, '#{\1}') }\" \n "
        end
    end

    func << " output; end \n "

    eval(func)
  end
end
```

index.html.trb

```html
<html>
<body>
  <ul>
  % data.each do |i|
    <li>{{i}}</li>
  % end
  </ul>
% # comments are just normal ruby comments
</body>
</html>

```

You can try the following in irb/pry.

```shell
>> index = Template.transform('index.html.trb', 'data')
=> nil
>> index.call(1,['Foo'])
=> "<html>\n <body>\n<ul>\n<li>Foo</li> \n</ul>\n </body>\n </html>\n"
```
