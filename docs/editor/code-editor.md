# Source Code Editor

Taio provides a full-fledged Markdown editor, we will share some technical details behind it.

In fact, creating an editor for Markdown **only** is never our goal. Markdown is just a `mode` of code editing, and the editor can support other modes as well. This design offers great flexibility, for example, Taio supports running JavaScript, it uses the same editor core with different `language features` when editing JavaScript.

On the other hand, even though Taio is not a general code editor, we provide syntax highlighting for commonly used programming languages, which allows users to have a better reading experience for source files.

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_17.png" width="360" />

## Syntax Highlighting

If we were targeting Markdown only, the problem might not be that complicated. But our goal is a source code editor, which requires support for many languages, and Markdown is just one of them.

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_18.png" width="360" />

Unlike the web community, it's hard to find a perfect open-source solution in the iOS ecosystem, but there are a few high-quality projects we can look to for inspiration.

**Pure Web Technologies**

We can simply wrap web projects like [highlight.js](https://highlightjs.org/) or [Prism](https://prismjs.com/) with a `WebView`, the development cost will be relatively low and **reading** experience is acceptable.

```xml
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="default.css">
    <script src="highlight.js"></script>
    <script>hljs.initHighlightingOnLoad();</script>
  </head>
  <body>
    <pre><code>const string = "Hello, World!";</code></pre>
  </body>
</html>
```

These web projects are quite reliable, but the downside is that it's hard to achieve great writing experience like native editors.

**Pure Native Technologies**

We can also implement syntax analysis logic using native language, and render the result using [TextKit](https://developer.apple.com/documentation/appkit/textkit). For examples, take a look at the [SavannaKit](https://github.com/louisdh/savannakit) project and its successor [Sourceful](https://github.com/twostraws/Sourceful).

The bad news is that we have to implement tons of logic ourselves, including language lexer and editor themes.

**Something in Between**

It is a good idea to combine the maturity of web technologies and the performance of native technologies, and here's the idea.

We can run the above JavaScript projects with [JavaScriptCore](https://developer.apple.com/documentation/javascriptcore), and render the result in a native way, the [Highlightr](https://github.com/raspu/Highlightr) project is built on top of this idea.

```xml
<span class="hljs-section"># Hi</span>

Hello, World!
```

With this solution, we can support hundreds of programming languages easily, and get numbers of editor themes for free.

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_19.png" width="360" />

> We can get some ideas from the above projects, but maintaining our own implementation is still a worthwhile investment. The editor is a core component, and we can hardly rely on the limited resources from the community.

## Auto Completion

Like many IDEs, Taio supports auto-completion, types inference, reference highlighting when editing JavaScript.

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_20.png" width="360" />

To implement these language features, Taio uses [Tern](https://ternjs.net/) to analyze the code and shows the results using TextKit.

Tern is a JavaScript project implemented for Node.js and browsers, it requires some work to be used on JavaScriptCore, details may be covered in a separate article later.

> General solution: [Language Server Protocol](https://microsoft.github.io/language-server-protocol/)

## Code Formatting

Automatic code formatting can offer a better editing experience, here are a few examples.

**Parentheses Completion**

After the user types `if (condition) {` and then hits a line break, what should appear on the editor is:

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_21.png" width="360" />

To implement this, we need to use a stack for [parentheses matching](https://leetcode.com/problems/valid-parentheses/) and then fill in the spaces based on the indentation level.

> Taio also detects whether the current code is indented based on spaces or tabs, and fills in different characters.

**List Completion**

The editor needs to auto-complete the formatting of Markdown lists, including unordered lists, ordered lists, and task lists, after a line break is inserted.

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_22.png" width="360" />

This is done by detecting if the previous line matches a regular expression, E.g. for ordered lists:

```regexp
^ *(\\d+)\\. +
```

We can find the line number from the first match group, and generate the next line. Similarly, `^ *- +\\\[[xX]\\\] +` is used for task lists.

The above examples all use `UITextViewDelegate`'s [shouldChangeTextIn](https://developer.apple.com/documentation/uikit/uitextviewdelegate/1618630-textview) method to implement:

```swift
func textView(_ textView: UITextView, shouldChangeTextIn range: NSRange, replacementText text: String) -> Bool {
  if text == "\n" {
    // Format the code
    return false
  }
  return true
}
```

**Tabs to Spaces**

Similar to many IDEs, Taio also supports converting tabs to spaces after they are typed on the keyboard. The approach is similar, just detect if `\t` is entered in `shouldChangeTextIn`.

> It may be better to make it configurable.

## Keyboard Shortcuts

`UITextView` natively supports shortcuts such as copy and paste, but to bring the experience closer to a desktop editor, we have provided Taio with richer support for:

- `⌘ -` increase font size, `⌘ +` decrease font size, `⌘ 0` reset font size
- `⌘ B` toggle bold, `⌘ I` toggle italic, `⌘ U` toggle underline
- `⌘ 1` heading level 1, `⌘ 2` heading level 2, `⌘ 3` heading level 3
- `⌘ [` decrease indent, `⌘ ]` increase indent

These shortcuts are intuitive to users, hold down `⌘` can show all supported shortcuts.

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_23.png" width="360" />

Implementing these just requires overriding the [keyCommands](https://developer.apple.com/documentation/uikit/uiresponder/1621141-keycommands) method of `UIResponder`:

```swift
override var keyCommands: [UIKeyCommand]? {
  return [
    UIKeyCommand(
      title: "Reset Font Size",
      image: nil,
      action: #selector(resetFontSize),
      input: "0",
      modifierFlags: .command,
      propertyList: nil
    )
  ]
}
```

> We need to make sure the corresponding UIResponder can be firstResponder.

## Fonts

Taio supports all fonts on the device:

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_24.png" width="360" />

We use [UIFontPickerViewController](https://developer.apple.com/documentation/uikit/uifontpickerviewcontroller) for this feature, but if you want to support user-installed fonts, you need to enable it in `Info.entitlements`:

```xml
<key>com.apple.developer.user-fonts</key>
<array>
  <string>app-usage</string>
</array>
```

In addition, FontPicker does not provide a good way to select `systemFont`, which would make it inconvenient to restore the default settings. What we did was to wrap the FontPicker to another UIViewController and add a `System Font` button to its navigation bar.

> We will lose the search bar, and there may be a better way to do it.

When working with source code, we use a monospaced font by default:

```swift
let font: UIFont? = {
  if #available(iOS 13.0, *) {
    return .monospacedSystemFont(ofSize: 15, weight: .regular)
  } else {
    return UIFont(name: "Menlo-Regular", size: 15)
  }
}()
```

## Line Spacing

We use the [lineHeightMultiple](https://developer.apple.com/documentation/uikit/nsmutableparagraphstyle/1524596-lineheightmultiple) feature for line spacing:

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_25.png" width="360" />

If it leads to text misalignment, we can adjust it with `NSLayoutManager`'s [drawGlyphs](https://developer.apple.com/documentation/uikit/nslayoutmanager/1403158-drawglyphs) method:

```swift
override func drawGlyphs(forGlyphRange glyphsToShow: NSRange, at origin: CGPoint) {
  // Change origin accordingly
  super.drawGlyphs(forGlyphRange: glyphsToShow, at: origin)
}
```

## Line Numbers

It is very common for code editors to show line numbers, and this option can be enabled in Taio as well:

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_26.png" width="360" />

This is also done in `NSLayoutManager`, by overriding the [drawBackground](https://developer.apple.com/documentation/uikit/nslayoutmanager/1402949-drawbackground) method, take the [CYRTextView](https://github.com/illyabusigin/CYRTextView) project as an example.

> In the same way, we can also implement the highlighting effect for the selected line.

## Parentheses Matching

We have already mentioned the method to find parentheses pair, and similar logic can be used to implement the parentheses highlighting feature provided in Xcode.

When the cursor goes through a parenthesis, we can find where the corresponding parenthesis is and highlight it.

<img src="https://github.com/cyanzhong/dev.taio.app/raw/master/docs/editor/assets/IMG_27.png" width="360" />

This will help the user identify a block of code, or a link in Markdown.

## More Content

The above is a summary of our experience in the past years of development, and we hope it will be helpful to you.

To support us, please try our app [Taio](https://taio.app) and let your friends know.

We will share more technical details in upcoming articles, please stay tuned.

> [!NOTE] Dec 30, 2020