var updater;
var timeSubmitted = null;
var epeptMode = null;
var resultsUri = "";

Ext.onReady(initPage);
Ext.onReady(loadTheoBanner);

function initPage() {
    Ext.QuickTips.init();
    var action = '/addama-rest/primary-repo/path/RobotForms/EPEPT/form_entry/html';
    var uploadFormComponent = null;
    var uploadForm = Permutation_pvalue.html.FormExt;
    uploadForm.init(action, function() {
        uploadFormComponent = uploadForm.getUploadFileFormComponent();
    });
    new Ext.Panel({
        title: "EPEPT Inputs " + "<a href='http://code.google.com/p/epept/wiki/Manual' target='_blank'>Help</a>",
        id: 'inputPanelId',
        deferredRender:false,
        renderTo: "input-panel",
        width:600,
        header: true,
        items: [uploadFormComponent]
    });
    new Ext.Panel({
        title: "Status and Results",
        border: true,
        id: 'outputPanelId',
        deferredRender:false,
        renderTo: "output-panel",
        width:900,
        header: true
    });

    loadResults();
}

function loadTheoBanner() {
    new Ext.Panel({
        id: 'header',
        border: true,
        deferredRender:false,
        items: [
            { title:"<a href='http://shmulevich.systemsbiology.net/' target='_blank'>Informatics@Shmulevich Lab</a>&nbsp;&nbsp;&nbsp;<a href='http://www.systemsbiology.org' target='_blank'>Institute for Systems Biology</a>&nbsp;&nbsp;&nbsp;&nbsp;<a href='http://code.google.com/p/epept/wiki/Manual' target='_blank'>Manual/Help</a>&nbsp;&nbsp&nbsp;&nbsp;<a href='http://code.google.com/p/epept/wiki/ExampleDatasets' target='_blank'>Example Datasets</a>&nbsp;&nbsp&nbsp;&nbsp;<a href='http://code.google.com/p/epept/wiki/WebServiceClients' target='_blank'>Source and Web Service Client Examples</a>"  }
        ],
        renderTo: 'theo-banner'
    });
}

function loadPreviousInputs(inputs) {
    var mode = inputs.mode;
    var uri = inputs.uri;
    if (mode == undefined){
        mode = 'Permutation Values';
    }
    Ext.getDom("results_filename").innerHTML = "<b>Previous Inputs</b> <br>Data File:<a href=' " + uri + '/' + inputs.filename + "' target='_blank'>" + "&nbsp;" + inputs.filename + "</a>" ;
    var method = inputs.method;
    Ext.getDom("results_method").innerHTML = "Mode: " + mode + "<br>Method name: " + method;
    var oopt = false;
    if (inputs.oopt_chk == 'on') {
        oopt = true;
    }
    var oopt_cb = new Ext.form.Checkbox({
        boxLabel: "Enable Optimal Order Preserving Transformation (OOPT)",
        name: 'oopt_prev_chk',
        id: 'oopt_prev_chk',
        checked: oopt,
        renderTo: 'results_oopt'
    });
    oopt_cb.render();
    var ci = false;
    if (inputs.ci_chk == 'on') {
        ci = true;
        Ext.getDom("results_lower_bound").innerHTML = " Confidence Interval: " + inputs["ci"] + "%<br>";
    } else {
        Ext.getDom("results_lower_bound").innerHTML = " Confidence Interval Not Enabled<br>";

    }
    var eci = new Ext.form.Checkbox({
        boxLabel: "Enable Confidence Interval",
    name: 'ci_prev_chk',
        id: 'ci_prev_chk',
        checked: ci,
        renderTo: "results_ci"
    });
    eci.render();
    var cc = false;

    if (inputs.cc_chk == 'on') {
        cc = true;
    }
    var ecc = new Ext.form.Checkbox({
        boxLabel: "Enable Convergence Criteria",
        name: 'cc_prev_chk',
        id: 'cc_prev_chk',
        checked: cc,
        renderTo: "results_cc"
    });
    ecc.render();

    var results_cc = Ext.getDom("results_previnputs");
    results_cc.innerHTML = "Random Seed: " + inputs.rseed;
    var emc = "None";
    if (inputs.mail_address && inputs.mail_address.indexOf("@") != -1){
    	emc = "xxx@" + inputs.mail_address.split("@")[1];
    }		
    results_cc.innerHTML += "<br>Email: " + emc; //inputs.mail_address;
    if (inputs.mode == 'SAM' || inputs.mode == 'GSEA'){
        results_cc.innerHTML += "<br>RespType: " + inputs.resptype;
        results_cc.innerHTML += "<br>NPerms: " + inputs.nperms;
    if (inputs.mode == 'GSEA'){
            results_cc.innerHTML += "<br>GSFile: " + "<a href=' " + uri + '/' + inputs.gsfile + "' target='_blank'>" + "&nbsp;" + inputs.gsfile + "</a>";
            results_cc.innerHTML += "<br>GSAMethod: " + inputs.gsa_method;
        }
    }
}

function loadResults() {
    var startTime = new Date();
    resultsUri = get_parameter("URI");
    if (resultsUri) {
        Ext.Ajax.request({
            url: resultsUri + "/structured?_dc=" + Math.random(),
            method: "get",
            success: function(o) {
                var json = Ext.util.JSON.decode(o.responseText);
		var uriStr = json.uri;
		uriStr = uriStr.substring(0,uriStr.length - 7);
		resultsUri = uriStr;
		Ext.Ajax.request({
	            url: uriStr + "/structured?_dc=" + Math.random(),
        	    method: "get",
            	success: function(o) {	
                	json = Ext.util.JSON.decode(o.responseText);
			var inputs = null;
                	if (json) {
                    		inputs = json.inputs;
                    		loadPreviousInputs(inputs);
                	}
                	if (json.status) {
                    		var now = new Date();
		    		timeSubmitted = inputs["submitted"];
		    		epeptMode = inputs["mode"];	
                    		Ext.getDom("status").innerHTML = "<h3>Status: <font color='green'>EPEPT Running...</font></h3>Submitted: " + timeSubmitted + "<br>" + "Time now: " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
                    		updater = new Ext.Updater("status");
   		    		updater.setRenderer(renderObj);    
		    		updater.startAutoRefresh(2, json.status.uri + "/structured?_dc=" + Math.random());
            }
        }
	});
	}
    });
  }
}

var renderObj = {"render":function(a, o){
//function onUpdate(o) {
                var jsonStatus = Ext.util.JSON.decode(o.responseText);
                var now = new Date();
                Ext.getDom("status").innerHTML = "<h3>Status: <font color='green'>EPEPT Running...</font></h3>Submitted: " + timeSubmitted + "<br>" + "Time now: " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();

                var timeCompleted = "";
                //var resultsUri = get_parameter("URI-UUID");
                if (jsonStatus.error != null || jsonStatus.completed != null) {
                                    updater.stopAutoRefresh();
                    Ext.Ajax.request({
                            url: resultsUri + "/logs/timeout.txt?_dc=" + Math.random(),
                            method: "get",
                             success: function(o) {
                                timeCompleted = o.responseText;
                                if (jsonStatus.error){
                                    Ext.getDom("status").innerHTML = "<h3>Status: Error</h3>Submitted on:" + timeSubmitted + " ended:" + timeCompleted + "<br>Msg:" + jsonStatus.error["message"];
                                            showErrors(resultsUri, epeptMode);
                                }else{
                         	           Ext.getDom("status").innerHTML = "<h3>Status: Completed</h3>Submitted on:" + timeSubmitted + " ended:" + timeCompleted;
                                          
		    	      showOutputs(resultsUri);
                                }
                        }
                    });
                }else if (jsonStatus.completed){
                	updater.stopAutoRefresh();
                	Ext.getDom("status").innerHTML = "<h3>Status: Completed</h3>Submitted on:" + timeSubmitted + " ended:" + timeCompleted;
                	showOutputs(resultsUri);
               }else if (jsonStatus.running) {
                                Ext.getDom("status").innerHTML = "<h3>Status: <font color='green'>Robot Running...</font></h3>Processing since: " + timeSubmitted;
                            } else if (jsonStatus.pending) {
                                Ext.getDom("status").innerHTML = "<h3>Status: <font color='blue'>Robot Pending...</font></h3>Submitted at: " + timeSubmitted;
                            }
}
}
function showOutputs(resultsUri) {
    if (resultsUri) {
        Ext.Ajax.request({
            url: resultsUri + "/structured?_dc=" + Math.random(),
            method: "get",
            success: function(o) {
                var json = Ext.util.JSON.decode(o.responseText);
                if (json) {
                    var inputs = json.inputs;
                    var outputs = json.outputs;
                    var xls = false;
                    var xlsx = false;
                    var inputFile = inputs.filename;
                    if (outputs) {
			var outfileName = "";
			if (inputFile.indexOf(".") == -1){
				//indicates no file extension use
				outfileName = inputFile + ".txt";
			}else{
                        var extensionIndex = inputFile.indexOf(".tsv");
                        if (extensionIndex == -1){
                           extensionIndex = inputFile.indexOf(".csv");
                        }
                     if (extensionIndex == -1){
                           extensionIndex = inputFile.indexOf(".txt");
                        }
                        if (extensionIndex == -1){
                           extensionIndex = inputFile.indexOf(".xlsx");
                           if (extensionIndex != -1){
                             xlsx = true;
                           }
                        }
                        if (extensionIndex == -1){
                           extensionIndex = inputFile.indexOf(".xls");
			   if (extensionIndex != -1)
				xls = true;
                        }
                        outfileName = inputFile.substring(0, extensionIndex);
                        if (xls){
                           outfileName = outfileName + "_xls_";
                        }
                        if (xlsx){
                           outfileName = outfileName + "_xlsx_";
                        }
                        outfileName = outfileName + ".txt";
                        }//end else
			var fileUri = "/Pvalues_" + outfileName;
                        var labelsUri = "/labels_" + outfileName;
                        var uri = outputs.uri;
                        var fileout = uri + fileUri;
                        var labelsout = uri + labelsUri;
                        var filepng = uri + "/plot.png";
                        var fileeps = uri + "/plot.eps";
                        Ext.getDom("imageContent").innerHTML = "<a href='" + fileeps + "'>Save Histogram as EPS format</a> "
                                + "&nbsp; <a href='" + filepng + "'><img src='" + filepng + "' title='Histogram" + "' width='15%' heigth='15%'></a><br><br>";
                        Ext.getDom("downloadLink").innerHTML = "<a href='" + fileout + "'>P-Values Result (right click to save)</a>";
                        showResults(fileout, labelsout);
                    }
                }
            }
        });
    }
}

function showErrors(resultsUri, mode) {
    var mymode = mode;
    Ext.getDom("resultsContent").innerHTML = "";
    Ext.getDom("stdoutContent").innerHTML = "";
    Ext.getDom("stderrContent").innerHTML = "";
    Ext.getDom("logs").style.display = "";
    if (resultsUri) {
        Ext.Ajax.request({
            url: resultsUri + "/structured?_dc=" + Math.random(),
            method: "get",
            success: function(o) {
                Ext.getDom("log_messages").innerHTML = "There were errors, here are the log outputs. Please email codefor@systemsbiology.org if you need more help<br><br>";
                var json = Ext.util.JSON.decode(o.responseText);
                if (json) {
                    var logs = json.logs;
                    if (logs) {
                        showLog(logs["error.log"], "stdoutContent");
                        showLog(logs["stderr.txt"], "stderrContent");
            if (mymode == 'SAM'){
                Ext.getDom("samlog").innerHTML = "<a href=' " + resultsUri + "/logs/samR.log'"  + ">" + "&nbsp;samR.log"  + "</a>";
            }
            if (mymode == 'GSEA'){
                var gsalogs = "";
                if (logs["gseaR1.log"] != null){
                    gsalogs  = gsalogs + "<a href=' " + resultsUri + "/logs/gseaR1.log'"  + ">" + "&nbsp;gseaR1.log"  + "</a>";
                }
                if (logs["gseaR2.log"] != null){
                                        gsalogs  = gsalogs + "<br><a href=' " + resultsUri + "/logs/gseaR2.log'"  + ">" + "&nbsp;gseaR2.log"  + "</a>";
                                }
                if (logs["gseaR3.log"] != null){
                                        gsalogs  = gsalogs + "<br><a href=' " + resultsUri + "/logs/gseaR3.log'"  + ">" + "&nbsp;gseaR3.log"  + "</a>";
                                }
                                Ext.getDom("gsealog").innerHTML = gsalogs;
                        }
                    }
                }
            }
        });
    }
}

function showResults(uri, labelsuri) {
    Ext.Ajax.request({
        method: "get",
        url: uri + "?_dc=" + Math.random(),
        success: function(o) {
            var responseData = o.responseText;
            showLabelResults(labelsuri, responseData);
        }
    });
}

Ext.override(Ext.form.Field, {
    adjustWidth : function(tag, w){
        tag = tag.toLowerCase();
        if(typeof w == 'number' && !Ext.isSafari){
            if(Ext.isIE && (tag == 'input' || tag == 'textarea')){
                if(!Ext.isStrict){
                    return this.inEditor ? w : w - 3;
                }
                if(tag == 'input' && Ext.isStrict){
                    return w - (Ext.isIE6 ? 4 : 1);
                }
                if(tag == 'textarea' && Ext.isStrict){
                    return w-4;
                }
            }else if(Ext.isOpera && Ext.isStrict){
                if(tag == 'input'){
                    return w + 2;
                }
                if(tag == 'textarea'){
                    return w-2;
                }
            }
        }
        return w;
    }
});

function showLabelResults(labelsuri, responseData) {
    Ext.Ajax.request({
        method: "get",
        url: labelsuri + "?_dc=" + Math.random(),
        success: function(ol) {
            var labelData = ol.responseText;
	    var	 resultsPanel = new Ext.form.FormPanel({
                        renderTo:"resultspanel",
                        title:"EPEPT Results",
                        width:525,
                        frame:true,
                        labelSeparator: "",
                        autoScroll:true,
                        items: [
                            new Ext.form.TextArea({
                                        id: "pvalueResultsId",
                                        fieldLabel: labelData,
                                        value: responseData,
                                        labelSeparator: "",
                                        anchor: '100% -30',
					height: 200,
                                        width: 1000,
                                        listeners: {
                                            render: function(c) {
                                                Ext.QuickTips.register({
                                                            target: c,
                                                            title: '',
                                                            text: labelData
                                                        });
                                            }
                                        }
                                    })
                         ]});
		}
    });
}

function showLog(log, textArea) {
    if (log && log.uri) {
        Ext.Ajax.request({
            url: log.uri + "?_dc=" + Math.random(),
            method: "get",
            success: function(o) {
                Ext.getDom(textArea).innerHTML = o.responseText;
            }
        });
    } else {
        Ext.getDom(textArea).innerHTML = "Unable to display log, refresh page to retry getting logs";
    }
}
