/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["jquery.sap.global","sap/ui/core/message/Message","sap/ui/model/BindingMode","sap/ui/model/Context","sap/ui/model/Model","sap/ui/model/odata/OperationMode","sap/ui/thirdparty/URI","./lib/_MetadataRequestor","./lib/_Requestor","./lib/_Parser","./ODataContextBinding","./ODataListBinding","./ODataMetaModel","./ODataPropertyBinding"],function(q,M,B,a,b,O,U,_,c,d,e,f,g,h){"use strict";var C="sap.ui.model.odata.v4.ODataModel",r=/^\w+$/,i=/^(\$auto|\$direct|\w+)$/,s={messageChange:true},S={annotationURI:true,autoExpandSelect:true,groupId:true,odataVersion:true,operationMode:true,serviceUrl:true,supportReferences:true,synchronizationMode:true,updateGroupId:true},j=["$apply","$count","$expand","$filter","$orderby","$search","$select"],E=["$count","$expand","$filter","$levels","$orderby","$search","$select"];var k=b.extend("sap.ui.model.odata.v4.ODataModel",{constructor:function(p){var H={"Accept-Language":sap.ui.getCore().getConfiguration().getLanguageTag()},o,P,l,u,t=this;b.apply(this);if(!p||p.synchronizationMode!=="None"){throw new Error("Synchronization mode must be 'None'");}o=p.odataVersion||"4.0";this.sODataVersion=o;if(o!=="4.0"&&o!=="2.0"){throw new Error("Unsupported value for parameter odataVersion: "+o);}for(P in p){if(!(P in S)){throw new Error("Unsupported parameter: "+P);}}l=p.serviceUrl;if(!l){throw new Error("Missing service root URL");}u=new U(l);if(u.path()[u.path().length-1]!=="/"){throw new Error("Service root URL must end with '/'");}if(p.operationMode&&p.operationMode!==O.Server){throw new Error("Unsupported operation mode: "+p.operationMode);}this.sOperationMode=p.operationMode;this.mUriParameters=this.buildQueryOptions(u.query(true),false,true);this.sServiceUrl=u.query("").toString();this.sGroupId=p.groupId;if(this.sGroupId===undefined){this.sGroupId="$auto";}if(this.sGroupId!=="$auto"&&this.sGroupId!=="$direct"){throw new Error("Group ID must be '$auto' or '$direct'");}this.checkGroupId(p.updateGroupId,false,"Invalid update group ID: ");this.sUpdateGroupId=p.updateGroupId||this.getGroupId();if(p.autoExpandSelect!==undefined&&typeof p.autoExpandSelect!=="boolean"){throw new Error("Value for autoExpandSelect must be true or false");}this.bAutoExpandSelect=p.autoExpandSelect===true;this.oMetaModel=new g(_.create(H,o,this.mUriParameters),this.sServiceUrl+"$metadata",p.annotationURI,this,p.supportReferences);this.oRequestor=c.create(this.sServiceUrl,H,this.mUriParameters,this.oMetaModel.fetchEntityContainer.bind(this.oMetaModel),function(G){if(G==="$auto"){sap.ui.getCore().addPrerenderingTask(t._submitBatch.bind(t,G));}},o);this.aAllBindings=[];this.sDefaultBindingMode=B.TwoWay;this.mSupportedBindingModes={OneTime:true,OneWay:true,TwoWay:true};}});k.prototype._submitBatch=function(G){return this.oRequestor.submitBatch(G)["catch"](function(o){q.sap.log.error("$batch failed",o.message,C);throw o;});};k.prototype.attachEvent=function(l){if(!(l in s)){throw new Error("Unsupported event '"+l+"': v4.ODataModel#attachEvent");}return b.prototype.attachEvent.apply(this,arguments);};k.prototype.bindContext=function(p,o,P){return new e(this,p,o,P);};k.prototype.bindingCreated=function(o){this.aAllBindings.push(o);};k.prototype.bindingDestroyed=function(o){var I=this.aAllBindings.indexOf(o);if(I<0){throw new Error("Unknown "+o);}this.aAllBindings.splice(I,1);};k.prototype.bindList=function(p,o,v,F,P){return new f(this,p,o,v,F,P);};k.prototype.bindProperty=function(p,o,P){return new h(this,p,o,P);};k.prototype.bindTree=function(){throw new Error("Unsupported operation: v4.ODataModel#bindTree");};k.prototype.buildBindingParameters=function(p,A){var R={},t=this;if(p){Object.keys(p).forEach(function(K){var v=p[K];if(K.indexOf("$$")!==0){return;}if(!A||A.indexOf(K)<0){throw new Error("Unsupported binding parameter: "+K);}if(K==="$$groupId"||K==="$$updateGroupId"){t.checkGroupId(v,false,"Unsupported value for binding parameter '"+K+"': ");}else if(K==="$$operationMode"){if(v!==O.Server){throw new Error("Unsupported operation mode: "+v);}}R[K]=v;});}return R;};k.prototype.buildQueryOptions=function(p,l,m){var P,t=q.extend(true,{},p);function n(o,u,A){var v,w,x,V=o[u];if(!l||A.indexOf(u)<0){throw new Error("System query option "+u+" is not supported");}if((u==="$expand"||u==="$select")&&typeof V==="string"){V=d.parseSystemQueryOption(u+"="+V)[u];o[u]=V;}if(u==="$expand"){for(x in V){w=V[x];if(w===null||typeof w!=="object"){w=V[x]={};}for(v in w){n(w,v,E);}}}else if(u==="$count"){if(typeof V==="boolean"){if(!V){delete o.$count;}}else{switch(typeof V==="string"&&V.toLowerCase()){case"false":delete o.$count;break;case"true":o.$count=true;break;default:throw new Error("Invalid value for $count: "+V);}}}}if(p){for(P in p){if(P.indexOf("$$")===0){delete t[P];}else if(P[0]==="@"){throw new Error("Parameter "+P+" is not supported");}else if(P[0]==="$"){n(t,P,j);}else if(!m&&P.indexOf("sap-")===0){throw new Error("Custom query option "+P+" is not supported");}}}return t;};k.prototype.checkGroupId=function(G,A,l){if(!A&&G===undefined||typeof G==="string"&&(A?r:i).test(G)){return;}throw new Error((l||"Invalid group ID: ")+G);};k.prototype.createBindingContext=function(p,o){var D,m,l,R,n;if(arguments.length>2){throw new Error("Only the parameters sPath and oContext are supported");}if(o&&o.getBinding){throw new Error("Unsupported type: oContext must be of type sap.ui.model.Context, "+"but was sap.ui.model.odata.v4.Context");}R=this.resolve(p,o);if(R===undefined){throw new Error("Cannot create binding context from relative path '"+p+"' without context");}n=R.indexOf('#');if(n>=0){D=R.slice(0,n);l=R.slice(n+1);if(l[0]==="/"){l="."+l;}m=this.oMetaModel.getMetaContext(D);return this.oMetaModel.createBindingContext(l,m);}return new a(this,R);};k.prototype.destroy=function(){this.oMetaModel.destroy();return b.prototype.destroy.apply(this,arguments);};k.prototype.destroyBindingContext=function(){throw new Error("Unsupported operation: v4.ODataModel#destroyBindingContext");};k.prototype.getContext=function(){throw new Error("Unsupported operation: v4.ODataModel#getContext");};k.prototype.getDependentBindings=function(p,l){return this.aAllBindings.filter(function(o){var m=o.getContext();return o.isRelative()&&!(l&&m&&m.created&&m.created())&&(m===p||m&&m.getBinding&&m.getBinding()===p);});};k.prototype.getGroupId=function(){return this.sGroupId;};k.prototype.getMetaModel=function(){return this.oMetaModel;};k.prototype.getObject=function(){throw new Error("Unsupported operation: v4.ODataModel#getObject");};k.prototype.getODataVersion=function(){return this.sODataVersion;};k.prototype.getOriginalProperty=function(){throw new Error("Unsupported operation: v4.ODataModel#getOriginalProperty");};k.prototype.getProperty=function(){throw new Error("Unsupported operation: v4.ODataModel#getProperty");};k.prototype.getUpdateGroupId=function(){return this.sUpdateGroupId;};k.prototype.hasPendingChanges=function(){return this.oRequestor.hasPendingChanges();};k.prototype.isList=function(){throw new Error("Unsupported operation: v4.ODataModel#isList");};k.prototype.refresh=function(G){this.checkGroupId(G);this.aBindings.slice().forEach(function(o){if(o.isRefreshable()){o.refresh(G);}});};k.prototype.reportError=function(l,R,o){var D=o.stack||o.message;if(D.indexOf(o.message)<0){D=o.message+"\n"+o.stack;}if(o.canceled){q.sap.log.debug(l,D,R);return;}q.sap.log.error(l,D,R);if(o.$reported){return;}o.$reported=true;sap.ui.getCore().getMessageManager().addMessages(new M({message:o.message,processor:this,technical:true,type:"Error"}));};k.prototype.requestCanonicalPath=function(o){return o.requestCanonicalPath();};k.prototype.resetChanges=function(G){G=G||this.sUpdateGroupId;this.checkGroupId(G,true);this.oRequestor.cancelChanges(G);this.aAllBindings.forEach(function(o){if(G===o.getUpdateGroupId()){o.resetInvalidDataState();}});};k.prototype.resolve=function(p,o){var R;if(p[0]==="/"){R=p;}else if(o){if(p){if(o.getPath().slice(-1)==="/"){R=o.getPath()+p;}else{R=o.getPath()+"/"+p;}}else{R=o.getPath();}}if(R&&R!=="/"&&R[R.length-1]==="/"&&R.indexOf("#")<0){R=R.slice(0,R.length-1);}return R;};k.prototype.setLegacySyntax=function(){throw new Error("Unsupported operation: v4.ODataModel#setLegacySyntax");};k.prototype.submitBatch=function(G){var t=this;this.checkGroupId(G,true);return new Promise(function(l){sap.ui.getCore().addPrerenderingTask(function(){l(t._submitBatch(G));});});};k.prototype.toString=function(){return C+": "+this.sServiceUrl;};return k;},true);