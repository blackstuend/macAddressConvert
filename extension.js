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
      // Step: 
      // 1. get select text,then split("\r\n") into lines
      // 2. for loop lines to line, and check every line whether have valid mac address
      // 3. if valid ,then check have symbol(/:.;-/)
      // 4. if have symbol, remove symbol
      // 6. otherwise, add symbol(:)
      // 5. return finish covert result,
      //    and show notification whether mac address have convert success.

      const editor = vscode.window.activeTextEditor;
      const selection = editor.selection;
      const selectText = editor.document.getText(selection);

      const lines = selectText.split('\n')

      let errorList = []

      let newLines = lines.map((line)=> {
        line = line.trim()

        if(regMacAddressNoSymbol.test(line)) {
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
    
      const result = newLines.join("\n")

      editor.edit(builder => builder.replace(selection, result))

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
      // Step: 
      // 1. get user select option
      // 2. option is remove symbol,and if mac address is valid ,then do remove symbol 
      //    option is added symbol,and if mac address is valid ,then do added symbol
      // 3. return finish covert result,
      //    and show notification whether mac address have convert success.
      const editor = vscode.window.activeTextEditor;
      const selection = editor.selection;
      const selectText = editor.document.getText(selection);

      const lines = selectText.split('\n')

      let errorList = []

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

      vscode.window.showQuickPick(pickItems,{
      }).then(item => {
        let newLines = lines.map((line)=> {
          line = line.trim()
  
          if(item.symbol) {
            context.workspaceState.update('macAddress.symbol',item.symbol)

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

        const result = newLines.join("\n")

        editor.edit(builder => builder.replace(selection, result))

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

