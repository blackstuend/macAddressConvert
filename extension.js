const vscode = require("vscode");

// regex for not have symbol mac address
const regMacAddressNoSymbol = /^([a-fA-F0-9]{2}){6}$/

// regex for have symbol mac address
const regMacAddressSymbol = /^([a-fA-F0-9]{2}[:\s,\.;-]){5}[a-fA-F0-9]{2}$/

// add symbol for mac address
// example: 1234567901A => 12:34:56:78:90:1A
function macAddressAddSymbol(text,symbol) { 
  return text.match(/.{1,2}/g).join(symbol)
}

// remove symbol for mac address
// symbol: [":",".","-"," ",:";"]
// example: 12:34:56:78:90:1A => 1234567901A
function macAddressRemoveSymbol(text) {
  return text.split(/[:\.;-\s]/).join("")
}



/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  let toggleConvert = vscode.commands.registerCommand(
    "test.toggleConvert",
    () =>{
      // 1. get select text,then split("\r\n") into lines
      const editor = vscode.window.activeTextEditor;
      const selection = editor.selection;
      const selectText = editor.document.getText(selection);

      const lines = selectText.split('\n')

      let errorList = []

      // 2. for loop lines to line
      let newLines = lines.map((line)=> {
        line = line.trim()

        // 3. verify line is which category
        //    # Category
        //    1. not symbol mac address: add symbol to result
        //    2. symbol mac address: remove symbol to result
        //    3. invalid mac address: nothing change,but save this line text for notification
        //    4. empty line: nothing change
        if(regMacAddressNoSymbol.test(line)) {
          // get symbol from workspace storage
          // if not have anything default is ":"
          let symbol = context.workspaceState.get('macAddress.symbol',":")

          return macAddressAddSymbol(line,symbol)
        } else if(regMacAddressSymbol.test(line)) {
          return macAddressRemoveSymbol(line)
        } else if (line.length > 0){
          errorList.push(line)

          return line
        } else {
          return line
        }
      })
    
      // 5. output result
      const result = newLines.join("\n")
      editor.edit(builder => builder.replace(selection, result))

      // 6. show notification whether mac address have all convert success or have error.
      let infoMessage = "Convert Mac Address success"
      if(errorList.length > 0 ) {
        infoMessage = `Convert mac Address fail,
        invalid mac address:${errorList.join(",")}`
      }
      vscode.window.showInformationMessage(infoMessage);
    }
  );

  
  context.subscriptions.push(toggleConvert);

  let selectConvert = vscode.commands.registerCommand(
    "test.selectConvert",
    () =>{
      // 1. get select text,then split("\r\n") into lines
      const editor = vscode.window.activeTextEditor;
      const selection = editor.selection;
      const selectText = editor.document.getText(selection);
      const lines = selectText.split('\n')

      let errorList = []

      // 2. set select menu list 
      let pickItems = [
        {
          label: "Remove Symbol"
        },
        {
          symbol:':',
          label: "Add symbol(:)"
        },
        {
          symbol:'-',
          label: "Add symbol(-)"
        },
        {
          symbol:'.',
          label: "Add symbol(.)"
        },
        {
          symbol:';',
          label: "Add symbol(;)"
        },
        {
          symbol:' ',
          label: "Add symbol(space)"
        },
      ]

      // 3. show select menu list
      vscode.window.showQuickPick(pickItems,{
      }).then(item => {
        // 4. for loop lines to line
        let newLines = lines.map((line)=> {
          line = line.trim()
  
          // 5. Handler select options
          if(item.symbol) {
            // save symbol to toggle command use
            context.workspaceState.update('macAddress.symbol',item.symbol)

            // handler line condition 
            //  1. not symbol mac address: add option symbol to result
            //  2. symbol mac address: replace new symbol to result
            //  3. invalid mac address: nothing change,but save this line text for notification
            //  4. empty line: nothing change
            if(regMacAddressNoSymbol.test(line)) {
              return macAddressAddSymbol(line,item.symbol)
            } else if(regMacAddressSymbol.test(line)){
              const noSymBolMacAddress = macAddressRemoveSymbol(line)

              return macAddressAddSymbol(noSymBolMacAddress,item.symbol)
            }  else if (line.length > 0){
              errorList.push(line)

              return line
            } else {
              return line
            }
          } else {
            // not have symbol option just remove symbol for line
            // if text not have symbol save and notification
            // if text is empty, nothing change
            if(regMacAddressSymbol.test(line)) {
              return macAddressRemoveSymbol(line)
            } else if (line.length > 0){
              errorList.push(line)

              return line
            } else {
              return line
            }
          }
        })

        // 6. output result
        const result = newLines.join("\n")
        editor.edit(builder => builder.replace(selection, result))

        // 7. show notification whether mac address have all convert success or have error.
        let infoMessage = "Convert Mac Address success"
        if(errorList.length > 0 ) {
          infoMessage = `Convert mac Address fail,
          invalid mac address:${errorList.join(",")}`
        }
        vscode.window.showInformationMessage(infoMessage);
      })
    }
  );

  context.subscriptions.push(selectConvert);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};

