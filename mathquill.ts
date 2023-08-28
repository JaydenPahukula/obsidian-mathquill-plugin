import { Extension } from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";
import { EditorView, WidgetType, Decoration, DecorationSet, ViewUpdate, ViewPlugin } from "@codemirror/view";
import { Notice } from "obsidian";


export function mathQuillExtension(): Extension {
    return [
        mathQuillPlugin
    ]
}

const mathQuillPlugin = ViewPlugin.fromClass(class {
    decorations: DecorationSet
  
    constructor(view: EditorView) {
      this.decorations = makeDecorations(view)
    }
  
    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged)
        this.decorations = makeDecorations(update.view)
    }
}, {
    decorations: v => v.decorations,
})

function makeDecorations(view: EditorView) : DecorationSet {
    let widgets = []
    let start = 0
    for (let {from, to} of view.visibleRanges) {
        syntaxTree(view.state).iterate({
            from, to,
            enter: (node) => {
                //new Notice(node.name+"\n"+view.state.doc.sliceString(node.from, node.to));
                // if (node.name == "math_variable-2" && (view.state.doc.sliceString(node.from, node.to) == "x")) {
                //     let isTrue = view.state.doc.sliceString(node.from, node.to) == "true";
                //     let deco = Decoration.replace({
                //         widget: new MathQuillWidget(),
                //         side: 1 
                //     })
                    
                // }
                if (node.name === 'formatting_formatting-math_formatting-math-begin_keyword_math_math-block') {
                    start = node.to;
                } else if (node.name === 'formatting_formatting-math_formatting-math-end_keyword_math_math-'){
                    let deco = Decoration.replace({
                        widget: new MathQuillWidget(),
                        side: 1
                    })
                    widgets.push(deco.range(start+1, node.from-1))
                }
            }
        })
    }
    return Decoration.set(widgets)
}

class MathQuillWidget extends WidgetType {
    constructor(){
        super()
    }
  
    eq(other: MathQuillWidget){
        return true
    }
  
    toDOM() {
        let span = document.createElement("span")
        span.innerText = "hellooooo"
        span.style.backgroundColor = "red"

        let ta = span.appendChild(document.createElement("input"))
        ta.type = "text"

        // add stylesheet
        let mqStyle = span.appendChild(document.createElement("link"))
        mqStyle.rel = "stylesheet"
        mqStyle.href = "mathquill-0.10.1/mathquill.css"
        // include jquery
        let jqueryScript = span.appendChild(document.createElement("script"))
        jqueryScript.src = "https://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"
        // include mathquill
        let mqScript = span.appendChild(document.createElement("script"))
        mqScript.src = "mathquill-0.10.1/mathquill.js"
        
        // math
        let mathSpan = span.appendChild(document.createElement("span"))
        mathSpan.id = "math-field"
        mathSpan.style.backgroundColor = "blue"
        let mathScript = span.appendChild(document.createElement("script"))
        mathScript.innerText = `
        var mathFieldSpan = document.getElementById('math-field');
        var latexSpan = document.getElementById('latex');
        var MQ = MathQuill.getInterface(2); // for backcompat
        var mathField = MQ.MathField(mathFieldSpan);
        mathField.typedText("y=x/2")`

        return span
    }
  
    ignoreEvent() { return false }
  }

// const mqViewPlugin = ViewPlugin.fromClass(class {
//     decorations: DecorationSet;
//     constructor(view: EditorView) {
//         this.decorations = this.compute(view);
//     }
//     update(u: ViewUpdate) {
//         if (u.docChanged || u.viewportChanged || u.selectionSet) {
//             this.decorations = this.compute(u.view);
//         }
//     }
//     compute(view: EditorView) {
//         var count = 0;
//         let widgets = [];
//         for (const { from, to } of view.visibleRanges) {
//             var start = 0;
//             syntaxTree(view.state).iterate({
//                 from, to,
//                 enter(node) {
//                     //new Notice(node.name+"\n"+view.state.doc.sliceString(node.from, node.to));
//                     if (node.name === 'formatting_formatting-math_formatting-math-begin_keyword_math_math-block') {
//                         new Notice("start");
//                         start = node.from;
//                         // const html = view.state.doc.sliceString(node.from, node.to); 
//                     } else if (node.name === 'formatting_formatting-math_formatting-math-end_keyword_math_math-'){
//                         let widget = Decoration.widget({
//                             widget: new mqWidget("hellloooo"),
//                             block: true
//                         })
//                         widgets.push(widget.range(start, node.to)); 
//                         new Notice("stop");
//                     }
//                 }
//             });
//         }
//         new Notice(widgets.length.toString());
//         return Decoration.set(widgets);
//     }
// });

// class mqWidget extends WidgetType {
//     constructor(readonly s: string) {
//         super();
//     }
//     eq(other: WidgetType) {
//         return (other as unknown as mqWidget).s === this.s;
//     }
//     toDOM() {
//         const div = document.createElement('div');
//         div.innerText = this.s;
//         return div;
//     }
// }