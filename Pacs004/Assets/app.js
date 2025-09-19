document.getElementById('convertBtn').addEventListener('click', handleConvert);


function decodeHtmlEntities(str) {
    const txt = document.createElement("textarea");
    txt.innerHTML = str;
    return txt.value;
}


function handleConvert() {
    const inputXML = "<env>" + decodeHtmlEntities(document.getElementById('input').value) + "</env>";
    if (!inputXML.trim()) {
        showError("Veuillez coller un message SWIFT XML valide.");
        return;
    }

    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(inputXML, "application/xml");

        // Check for parse errors
        const parserError = xmlDoc.getElementsByTagName("parsererror");
        if (parserError.length > 0) {
            showError("Erreur de parsing XML : " + parserError[0].textContent);
            return;
        }

        // Extract AppHdr
        const appHdr = xmlDoc.getElementsByTagNameNS("*", "AppHdr")[0];
        const headerData = extractAppHdrData(appHdr);

        // Extract Document data
        const documentNode = xmlDoc.getElementsByTagNameNS("*", "Document")[0];
        const docData = extractDocumentData(documentNode);

        // Combine mapping
        const fullData = { ...headerData, ...docData };

        // Generate output
        const appHdrOut = generateAppHdr(fullData);
        const documentOut = generateDocument(fullData);

        document.getElementById('output-apphdr').value = formatXml(appHdrOut);
        document.getElementById('output-document').value = formatXml(documentOut);
		showError("Pacs.004 successfuly created.", "ok");
    } catch (e) {
        showError("Erreur : " + e.message);
    }
}

function extractAppHdrData(appHdr) {
    if (!appHdr) return {};

    const getText = (tag) => {
        const el = appHdr.getElementsByTagNameNS("*", tag)[0];
        return el ? el.textContent : "";
    };

    return {
        Fr: getText("Fr") ? getText("Fr").trim() : "",
        To: getText("To") ? getText("To").trim() : "",
        OriginalBizMsgId: getText("BizMsgIdr"),
        OriginalMsgDef: getText("MsgDefIdr"),
        OriginalCreation: getText("CreDt")
    };
}

function extractDocumentData(documentNode) {
    const data = {};

    const find = (tag, mode = "textOnly") => {
        const el = documentNode.getElementsByTagNameNS("*", tag)[0];
        if (!el) return "";

        const serializer = new XMLSerializer();

        if (mode === "rawXML") {
            const serialized = serializer.serializeToString(el);
            const withoutNamespaces = serialized.replace(/ xmlns(:\w+)?="[^"]*"/g, "");
            const cleanTags = withoutNamespaces.replace(/<(\/?)(\w+:)/g, "<$1");
            return cleanTags.trim();
        }

        if (mode === "innerXML") {
            let innerXML = "";
            el.childNodes.forEach(child => {
                innerXML += serializer.serializeToString(child);
            });
            const cleaned = innerXML
                .replace(/ xmlns(:\w+)?="[^"]*"/g, "")
                .replace(/<(\/?)(\w+:)/g, "<$1");
            return cleaned.trim();
        }

        // Par défaut : texte brut
        return el.textContent.trim();
    };

    data.TransactionId = find("InstrId") || find("OrgnlInstrId");
    data.EndToEndId = find("EndToEndId") || find("OrgnlEndToEndId");
    data.UETR = find("UETR");
    data.InstructedAmount = find("InstdAmt");
    data.Currency = find("InstdAmt") ? documentNode.getElementsByTagNameNS("*", "InstdAmt")[0]?.getAttribute("Ccy") : "EUR";
    data.DateTime = find("IntrBkSttlmDt");
    data.Instructed = find("InstdAgt", "textOnly");
    data.Instructing = find("InstgAgt", "textOnly");
    data.Creditor = find("Cdtr", "textOnly");
    data.Creditor_BIC = find("CdtrAgt", "innerXML");
    data.CreditorAgent = find("CdtrAgt", "innerXML");
    data.DebtorAgent = find("DbtrAgt", "innerXML");;
    data.Debtor = find("Dbtr", "innerXML");
    data.Debtor_BIC = find("DbtrAgt", "innerXML");
    data.PreviousAgent2 = find("PrvsInstgAgt2", "innerXML");
    data.SettlementAccount = find("SttlmAcct", "innerXML");

    return data;
}

function generateAppHdr(data) {
    //const now = new Date().toISOString();
	const now = new Date().toLocaleString("sv-SE", { timeZone: "Europe/Rome" }).replace(" ", "T");
	const saaFormat = now.split(".")[0] + "+00:00";
    return `
<AppHdr xmlns="urn:iso:std:iso:20022:tech:xsd:head.001.001.02">
  <Fr><FIId><FinInstnId><BICFI>${data.To || "UNKNOWN_TO"}</BICFI></FinInstnId></FIId></Fr>
  <To><FIId><FinInstnId><BICFI>${data.Fr || "UNKNOWN_FR"}</BICFI></FinInstnId></FIId></To>
  <BizMsgIdr>PAYMENT RETURN-${now.slice(0,10).replace(/-/g,"")}</BizMsgIdr>
  <MsgDefIdr>pacs.004.001.09</MsgDefIdr>
  <BizSvc>swift.cbprplus.02</BizSvc>
  <CreDt>${saaFormat}</CreDt>
</AppHdr>`.trim();
}

function generateDocument(data) {
    const now = new Date().toISOString();
	//const now = new Date().toLocaleString("sv-SE", { timeZone: "Europe/Rome" }).replace(" ", "T");
	const saaFormat = now.substring(0, now.length-1) + "+00:00";
    const dateOnly = now.slice(0, 10);
    return `
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.004.001.09">
  <PmtRtr>
    <GrpHdr>
      <MsgId>PAYMENT RETURN-${dateOnly.replace(/-/g,"")}</MsgId>
      <CreDtTm>${saaFormat}</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <SttlmInf>
	    <SttlmMtd>INDA</SttlmMtd>
	    <SttlmAcct>${data.SettlementAccount.split("<Ccy>")[0] || "NOT PROVIDED"}</SttlmAcct>
	  </SttlmInf>
    </GrpHdr>
    <TxInf>
      <OrgnlInstrId>${data.TransactionId || ""}</OrgnlInstrId>
      <OrgnlEndToEndId>${data.EndToEndId || ""}</OrgnlEndToEndId>
      <OrgnlUETR>${data.UETR || ""}</OrgnlUETR>
      <OrgnlIntrBkSttlmAmt Ccy="${data.Currency}">${data.InstructedAmount}</OrgnlIntrBkSttlmAmt>
      <OrgnlIntrBkSttlmDt>${data.DateTime}</OrgnlIntrBkSttlmDt>
      <RtrdIntrBkSttlmAmt Ccy="${data.Currency}">${data.InstructedAmount}</RtrdIntrBkSttlmAmt>
      <IntrBkSttlmDt>${dateOnly}</IntrBkSttlmDt>
      <RtrdInstdAmt Ccy="${data.Currency}">${data.InstructedAmount}</RtrdInstdAmt>
      <ChrgBr>SHAR</ChrgBr>
      <InstgAgt><FinInstnId><BICFI>${data.Instructed || "INSTRUCTED"}</BICFI></FinInstnId></InstgAgt>
      <InstdAgt><FinInstnId><BICFI>${data.Instructing || "INSTRUCTING"}</BICFI></FinInstnId></InstdAgt>
      <RtrChain>
        <Dbtr>
          <Agt><FinInstnId><BICFI>${data.Instructed || "CRED_BIC"}</BICFI></FinInstnId></Agt>
        </Dbtr>
		
		<CdtrAgt>
          ${data.PreviousAgent2 || data.DebtorAgent}
        </CdtrAgt>
		
        <Cdtr>
          <Pty>${data.Debtor || "DEBT_BIC"}\n</Pty>
        </Cdtr>
      </RtrChain>
      <RtrRsnInf><Rsn><Cd>AC01</Cd></Rsn></RtrRsnInf>
    </TxInf>
  </PmtRtr>
</Document>`.trim();
}

function formatXml(xml) {
    let formatted = '', indent = '';
    xml.split(/>\s*</).forEach(function (node) {
        if (node.match(/^\/\w/)) indent = indent.slice(2);
        formatted += indent + '<' + node + '>\n';
        if (node.match(/^<?\w[^>]*[^/]$/)) indent += '  ';
    });
    return formatted.trim().replace(/^<|>$/g, '');
}

function showError(msg, ok) {
    const errorBox = document.getElementById('error');
    errorBox.textContent = msg;
    errorBox.style.opacity = msg ? '1' : '.5';
	errorBox.style.backgroundColor = ok ? 'rgba(194,239,194,.2)' : 'rgba(252,169,169,.2)';
}

function copyToClipboard(myInput) {
  // Get the text field
  var copyText = document.getElementById(myInput);

  // Select the text field
  copyText.select();
  copyText.setSelectionRange(0, 99999); // For mobile devices

   // Copy the text inside the text field
  navigator.clipboard.writeText(copyText.value);

}

