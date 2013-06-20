
function EnergyFolks(type)
{
this.calendar_type=2; //0 is calendar, 1 is weekly, 2 is agenda
if(this.type == 'calendar') {
    var t=EnFolks_getCookie("EnFolksCal");
    if(t != null)
        this.calendar_type=t;
    else
        this.calendar_type=0;
}
if(this.type == "calendar-agenda") {
    this.type="calendar";
    this.calendar_type=2;
}
if(this.type == "calendar-weekly") {
    this.type="calendar";
    this.calendar_type=1;
}
if(this.type == "calendar-monthly") {
    this.type="calendar";
    this.calendar_type=0;
}
if(this.type == "bulletins")
    this.type='announce';
if(this.type == "bulletins-long") {
    this.type='announce';
    this.longformat=true;
}
if(this.type == "bulletins-forum") {
    this.type='announce';
}
if(this.type == "bulletins-stream") {
    this.type='announce';
    this.streamFormat=true;
}
if(this.type == 'blog')
    this.streamFormat=true;
}
function EnFolks_Add_Onload(infunc) {
    //ADD TO JQUERY ONLOAD HERE
}
EnergyFolks.prototype.RegisterCustomCSS = function() {
    this.CustomCSS=true;
}
EnergyFolks.prototype.TopBarHighlight = function() {
}
EnergyFolks.prototype.Initialize = function(body_div)
{
    /*
     Main initialization function.  Call after you load the class with the following inputs:
     - div name for a container element holding the main body of your page.  This div is hidden when showing 'detail' views,
     so it often also includes the searchbar and a title bar.
     This function MUST be called within the body div, as it outputs the 'results' div for you and adds it to the DOM

     */
    EnFolksLanguage.langloading=EnFolksLanguage.loading;
    this.div_name="EnfolksResultDiv";
    this.detail_div="EnFolksDetail";
    this.body_div="EnFolksmainbodydiv";
    this.bounding_div=body_div;
    var bgstyle='background-color:#'+EnFolks_Default_Color+";";
    if(this.CustomCSS) bgstyle="";
    document.write("<div id='EnFolksModBar' style='display:none;padding:4px;margin:0px;'></div><div id='EnFolksTopBarDiv' style='display:block;'><div id='EnFolkSBarNew' style='z-index:41;position:relative;height:26px;margin:5px;'></div><div style='display:none;padding:4px;text-align:center;cursor:pointer;background-image:url(https://images.energyfolks.com/images/fadebox/white/1.png);' onmouseover='this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/white/25.png)\";' onmouseout='this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/white/1.png)\";' id='EnFolksWarningBarLink' onclick='EnFolks_get_object(\"EnFolksWarningBar\").style.display=\"block\";'><span id='EnFolks_show_restricted_content'>"+EnFolksLanguage.show_restricted_content+"</span></div></div><div id='EnFolksPostDiv' style='display:none;'></div><div id='EnFolksSelectThreadDiv' style='display:block;'><div id='EnFolksSelectThread' style='font-size:12px;text-align:left;display:none;padding:2px 2px 2px 4px;'></div></div><div id='"+this.div_name+"' style='display:block;'></div><div id='"+this.div_name+"botbar' align=center style='display:none;font-size:9px;'></div><img src='https://images.energyfolks.com/images/blank.gif' width=1 height=1 border=0 id='EnFolks_bottomimg'>");
    this.loading(this.div_name);
    var now=new Date();
    if(this.type=='calendar')
        document.write("<div style='text-align:center;font-size:11px;'><i>"+EnFolksLanguage.all_times_shown_in_your_computers_timezone+" ("+ now.format("Z") + ")</i></div>")
    var i = (location.href + '').indexOf("www.energyfolks.com", 0);
    var k = (location.href + '').indexOf("www.energyfolks.com/developer", 0);
    if (k === -1 ? false : true) i=-1;
    if (i === -1 ? true : false) {
        EnFolks_get_object(this.div_name+"botbar").innerHTML="<i>&copy; Copyright " + this.date("Y") + " <a href='https://www.energyfolks.com/' target='_blank'>energyfolks</a>.  </i> <a href='javascript:window.open(\"https://www.energyfolks.com/welcome/privacyOUT\",\"privwin\",\"width=750\");'>Privacy Policy</a> | <a href='javascript:window.open(\"https://www.energyfolks.com/welcome/termsOUT\",\"privwin\",\"width=750\");'>Terms of Use</a>";
        EnFolks_get_object(this.div_name+'botbar').style.display='block';
    }
    window.onload = function(obj,tmpFunc){return function() {
        if(!(tmpFunc === null || tmpFunc === undefined))
            tmpFunc();
        var mydiv = EnFolks_get_object(obj.bounding_div);
        temp=mydiv.innerHTML;
        mydiv.innerHTML="<div id='"+obj.body_div+"' class='EnFolksClass' style='display:block;'></div>";
        EnFolks_get_object(obj.body_div).innerHTML=temp;
        var backtotopdiv = document.createElement('div');
        backtotopdiv.setAttribute('id', "EnFolks_back_to_top");
        setStyle(backtotopdiv,'display:none;cursor:pointer;width:300px;text-align:center;vertical-align:middle;position:fixed;top:0px;left:0px;padding:3px;border:1px solid black;border-top-width:0px;background-image:url(https://images.energyfolks.com/images/fadebox/white/90.png);font-size:14px;font-weight:bold;');
        document.getElementsByTagName('body')[0].appendChild(backtotopdiv);
        EnFolks_get_object("EnFolks_back_to_top").innerHTML="<img src='https://images.energyfolks.com/images/icons/uarrow.png' align=absmiddle style='display:inline;padding:0px 20px 0px 20px;' border=0>Back to Top<img src='https://images.energyfolks.com/images/icons/uarrow.png' align=absmiddle style='display:inline;padding:0px 20px 0px 20px;' border=0>";
        EnFolks_get_object("EnFolks_back_to_top").onclick=function() {EnFolksSmoothScroll(0);};
        var popupdiv = document.createElement('div');
        popupdiv.setAttribute('id', obj.div_name+"popup");
        setStyle(popupdiv,'display:none;position:absolute;top:0px;left:0px;z-index:69;');
        document.getElementsByTagName('body')[0].appendChild(popupdiv);
        var gout2 = document.createElement('div');
        gout2.setAttribute('id', 'EnFolks_greyout2');
        setStyle(gout2,'display:none;position:fixed;top:0px;left:0px;right:0px;bottom:0px;z-index:60; filter:alpha(opacity=30);opacity:.3;MozOpacity:.3;background-color:#000000;');
        document.getElementsByTagName('body')[0].appendChild(gout2);
        EnFolks_get_object("EnFolks_greyout2").onclick=function(obj2){return function(){obj2.BackToResults();};}(obj);
        var loaddiv = document.createElement('div');
        loaddiv.setAttribute('id', obj.div_name+"loading");
        loaddiv.setAttribute('class','EnFolksClass');
        setStyle(loaddiv,'text-align:center;width:180px;position:absolute;top:0px;left:0px;border:solid 1px #282828;background-image:url(https://images.energyfolks.com/images/fadebox/white/70.png);padding:60px;display:none;z-index:69;');
        document.getElementsByTagName('body')[0].appendChild(loaddiv);
        EnFolks_get_object(obj.div_name+"loading").innerHTML="<h5>"+EnFolksLanguage.loading+"...</h5><img class='inline' src='https://images.energyfolks.com/images/loader.gif' border=0>";
        var detdiv = document.createElement('div');
        detdiv.setAttribute('id', obj.detail_div);
        detdiv.setAttribute('class','EnFolksClass');
        setStyle(detdiv,'display:none;position:absolute;top:0px;left:0px;z-index:70;width:900px;');
        document.getElementsByTagName('body')[0].appendChild(detdiv);
        EnFolks_get_object(obj.detail_div).innerHTML='<table border="0" cellpadding="0" cellspacing="0" width="100%"><tr>' +
            "<td style='width:8px;border:0px solid black;background-image:url(https://images.energyfolks.com/images/calendar/fadewhite.png);background-color:transparent;margin:0px;padding:0px;'><img src='https://images.energyfolks.com/images/blank.gif' width=8 height=800></td>" +
            '<td align="center" style="text-align:center;background-color:white;border:0px solid black;"><div style="padding:2px;height:21px;text-align:right;"><a href="javascript:;" id="AIDreturn2"><img src="https://images.energyfolks.com/images/icons/closegreycircle.png" style="display:inline;width:35px;height:35px;border-width:0px;position:relative;top:-10px;left:10px;"></a></div>' +
            "<div id='EnergyFolksDetailsDiv' style='padding:0px 20px 20px 20px;'></div>" +
            "</td></tr></table>";
        /* EnFolks_get_object(obj.detail_div).innerHTML="<table bprder=0 cellpadding=0 cellspacing=0 width='100%'><tr>"
         + "<td style='width:8px;border:0px solid black;border-top-width:1px;border-bottom-width:1px;background-image:url(https://images.energyfolks.com/images/calendar/fadewhite.png);background-color:transparent;margin:0px;padding:0px;'><img src='https://images.energyfolks.com/images/blank.gif' width=8 height=800></td>"
         + "<td style='background-color:white;border:0px solid black;border-top-width:1px;border-bottom-width:1px;padding:3px;margin:0px;'><div id='EnergyFolksDetailsDiv'></div></td>"
         + "<td style='width:15px;background-color:black;margin:0px;padding:0px;border:1px solid black;cursor:pointer;color:white;vertical-align:top;text-align:center;' id='AIDreturn2'><img src='https://images.energyfolks.com/images/deleteon2.png' class='inline' border=0></td>"
         + "</tr></table>"; */
        EnFolks_get_object("AIDreturn2").onclick=function(obj2){return function(){obj2.BackToResults();};}(obj);
        obj.LoadViews();
        if(obj.loadbar) {
            var ShowSearch=true;
            obj.AjaxRequest("https://www.energyfolks.com/"+obj.type+"/GetSearchBar/"+EnFolksAffiliateId+"/"+obj.ThreadValue+"/"+obj.language);
            if(obj.FixBar) {
                window.onscroll = function(tmpFunc,obj) {return function() {
                    if(!(tmpFunc === null || tmpFunc === undefined))
                        tmpFunc();
                    obj.SearchBarFixed();
                };}(window.onscroll,obj);
            }
        }
        else if(!EnFolks_get_object("EnergyFolksSubmit")) {
            var ShowSearch=false;
            //no searchbar...we want one!  put it into a hidden div
            var popupdiv = document.createElement('div');
            popupdiv.setAttribute('id', "EnergyFolksSearchBar");
            setStyle(popupdiv,'display:none;');
            document.getElementsByTagName('body')[0].appendChild(popupdiv);
            var popupdiv = document.createElement('div');
            popupdiv.setAttribute('id', "EnergyFolksSubmit");
            setStyle(popupdiv,'display:none;');
            document.getElementsByTagName('body')[0].appendChild(popupdiv);
            obj.AjaxRequest("https://www.energyfolks.com/"+obj.type+"/GetSearchBar/"+EnFolksAffiliateId+"/"+obj.ThreadValue+"/"+obj.language);
        } else {
            var ShowSearch=true;
            if(obj.FixBar) {
                window.onscroll = function(tmpFunc,obj) {return function() {
                    if(!(tmpFunc === null || tmpFunc === undefined))
                        tmpFunc();
                    obj.SearchBarFixed();
                };}(window.onscroll,obj);
            }
        }
        /*else if((obj.type == 'calendar') && (EnFolks_get_object('EnergyFolksSubmit'))) {
         var slider = new dhtmlxSlider("Enfolks_sliderBox", 170,1,1000,1,1000,'EnergyFolksSlider');
         slider.setImagePath("/images/slider/");
         slider.init();
         slider.enableTooltip(false);
         EnFolks_get_object("EnergyFolksSliderLeft").innerHTML=1;
         EnFolks_get_object("EnergyFolksSliderRight").innerHTML=1000;
         EnFolks_get_object("EnergyFolksSliderLeftinput").value=1;
         EnFolks_get_object("EnergyFolksSliderRightinput").value=1000;
         var slider2 = new dhtmlxSlider("Enfolks_sliderBox2", 170,0,100,0,100,'EnergyFolksSlider2');
         slider2.setImagePath("/images/slider/");
         slider2.init();
         slider2.enableTooltip(false);
         EnFolks_get_object("EnergyFolksSlider2Left").innerHTML=0;
         EnFolks_get_object("EnergyFolksSlider2Right").innerHTML=100;
         EnFolks_get_object("EnergyFolksSlider2Leftinput").value=0;
         EnFolks_get_object("EnergyFolksSlider2Rightinput").value=100;
         }*/
        obj.AttachSearchBar();
        EnFolks_DivName=obj.div_name;
        if(obj.ShowCreateNewOnBar) var right=100; else var right=0;
        var text2 = "<div style='width:118px;position:absolute;top:0px;left:0px;background-color:transparent;border:1px solid black;font-size:14px;display:none;' id='EnFolksTermsPulldown'>"
            + "<div onclick='EnFolks_get_object(\"EnFolksTermsPulldownClose\").style.display=\"none\";EnFolks_get_object(\"EnFolksTermsPulldown\").style.display=\"none\";' style='background-image:url(https://images.energyfolks.com/images/fadebox/black/15.png);cursor:pointer;height:25px;border:0px solid black;border-bottom-width:1px;'></div>";
        if(obj.type == "calendar") {
            var text="<div style='position:absolute;top;0px;height:26px;right:"+(right+308)+"px;width:39px;padding:0px;padding-top:2px;text-align:center;font-weight:normal;background-color:#e6e6e6;font-size:16px;background-image:url(https://images.energyfolks.com/images/fadebox/white/1.png);border:0px solid white;cursor:pointer;' onmouseover='this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/black/15.png)\";' onmouseout='if(this.style.fontWeight==\"bold\") this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/black/25.png)\"; else this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/white/1.png)\";' id='Enfolks_calmonthly'><img src='https://images.energyfolks.com/images/topbar/monthdark.png' border=0 class=inline></div>"
                + "<div style='position:absolute;top;0px;height:26px;right:"+(right+268)+"px;width:39px;padding:0px;padding-top:2px;text-align:center;font-weight:normal;background-color:#e6e6e6;font-size:16px;background-image:url(https://images.energyfolks.com/images/fadebox/white/1.png);border:0px solid white;cursor:pointer;' onmouseover='this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/black/15.png)\";' onmouseout='if(this.style.fontWeight==\"bold\") this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/black/25.png)\"; else this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/white/1.png)\";' id='Enfolks_calweekly'><img src='https://images.energyfolks.com/images/topbar/weeklydark.png' border=0 class=inline></div>"
                + "<div style='position:absolute;top;0px;height:26px;right:"+(right+228)+"px;width:39px;padding:0px;padding-top:2px;text-align:center;font-weight:normal;background-color:#e6e6e6;font-size:16px;background-image:url(https://images.energyfolks.com/images/fadebox/white/1.png);border:0px solid white;cursor:pointer;' onmouseover='this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/black/15.png)\";' onmouseout='if(this.style.fontWeight==\"bold\") this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/black/25.png)\"; else this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/white/1.png)\";' id='Enfolks_calagenda'><img src='https://images.energyfolks.com/images/topbar/listdark.png' border=0 class=inline></div>"
                + "<div style='position:absolute;top;0px;height:26px;right:"+(right+188)+"px;width:39px;padding:0px;padding-top:2px;text-align:center;font-weight:normal;background-color:#e6e6e6;font-size:16px;background-image:url(https://images.energyfolks.com/images/fadebox/white/1.png);border:0px solid white;cursor:pointer;' onmouseover='this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/black/15.png)\";' onmouseout='if(this.style.fontWeight==\"bold\") this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/black/25.png)\"; else this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/white/1.png)\";' id='Enfolks_calmap'><img src='https://images.energyfolks.com/images/topbar/mapdark.png' border=0 class=inline></div>"
                + "<div style='position:absolute;top;0px;height:26px;right:"+(right)+"px;width:39px;padding:0px;padding-top:2px;text-align:center;font-weight:normal;background-color:#e6e6e6;font-size:16px;background-image:url(https://images.energyfolks.com/images/fadebox/white/1.png);border:0px solid white;cursor:pointer;' onmouseover='this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/black/15.png)\";' onmouseout='this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/white/1.png)\";' id='Enfolks_ical'><img src='https://images.energyfolks.com/images/topbar/icaldark.png' border=0 style='display:inline;'></div>"
                + "<div style='position:absolute;top;0px;height:26px;right:"+(right+40)+"px;width:39px;padding:0px;padding-top:2px;text-align:center;font-weight:normal;background-color:#e6e6e6;font-size:16px;background-image:url(https://images.energyfolks.com/images/fadebox/white/1.png);border:0px solid white;cursor:pointer;' onmouseover='this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/black/15.png)\";' onmouseout='this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/white/1.png)\";' id='Enfolks_rss'><img src='https://images.energyfolks.com/images/topbar/rssdark.png' border=0 style='display:inline;'></div>"
                + "<div style='position:absolute;top;0px;height:23px;right:"+(right+80)+"px;width:99px;padding:0px;padding-top:5px;text-align:center;font-weight:normal;background-color:#e6e6e6;color:#606060;font-size:10px;background-image:url(https://images.energyfolks.com/images/fadebox/white/1.png);border:0px solid white;cursor:pointer;' onmouseover='this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/black/15.png)\";' onmouseout='this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/white/1.png)\";' id='EnFolksRegionLink'><span id='EnFolksRegion'>"+EnFolksLanguage.langloading+"</span></div>";
            right+=358;
            text2+= "<div onmouseover='this.style.backgroundColor=\"#cccccc\";' onmouseout='this.style.backgroundColor=\"white\";' style='cursor:pointer;background-color:white;padding:2px;' onclick='EnFolks_get_object(\"EnFolksTermsPulldownClose\").style.display=\"none\";EnFolks_get_object(\"EnFolksTermsPulldown\").style.display=\"none\";EnFolks_get_object(\"EnergyFolksterms1\").checked=true;EnFolks_get_object(\"EnFolks_EventTitle2\").innerHTML=EnFolksLanguage.EventTitle;' id='EnFolks_EventTitle'>"+EnFolksLanguage.EventTitle+"</div>"
                + "<div onmouseover='this.style.backgroundColor=\"#cccccc\";' onmouseout='this.style.backgroundColor=\"white\";' style='cursor:pointer;background-color:white;padding:2px;' onclick='EnFolks_get_object(\"EnFolksTermsPulldownClose\").style.display=\"none\";EnFolks_get_object(\"EnFolksTermsPulldown\").style.display=\"none\";EnFolks_get_object(\"EnergyFolksterms2\").checked=true;EnFolks_get_object(\"EnFolks_EventTitle2\").innerHTML=EnFolksLanguage.Description;' id='EnFolks_Description'>"+EnFolksLanguage.Description+"</div>"
                + "<div onmouseover='this.style.backgroundColor=\"#cccccc\";' onmouseout='this.style.backgroundColor=\"white\";' style='cursor:pointer;background-color:white;padding:2px;' onclick='EnFolks_get_object(\"EnFolksTermsPulldownClose\").style.display=\"none\";EnFolks_get_object(\"EnFolksTermsPulldown\").style.display=\"none\";EnFolks_get_object(\"EnergyFolksterms3\").checked=true;EnFolks_get_object(\"EnFolks_EventTitle2\").innerHTML=EnFolksLanguage.Location;' id='EnFolks_Location'>"+EnFolksLanguage.Location+"</div>"
                + "</div>";
        } else if(obj.type == "users") {
            var text="";
            text2 += "<div onmouseover='this.style.backgroundColor=\"#cccccc\";' onmouseout='this.style.backgroundColor=\"white\";' style='cursor:pointer;background-color:white;padding:2px;' onclick='EnFolks_get_object(\"EnFolksTermsPulldownClose\").style.display=\"none\";EnFolks_get_object(\"EnFolksTermsPulldown\").style.display=\"none\";EnFolks_get_object(\"EnergyFolksterms1\").checked=true;EnFolks_get_object(\"EnFolks_full_name2\").innerHTML=EnFolksLanguage.full_name;' id='EnFolks_full_name'>"+EnFolksLanguage.full_name+"</div>"
                + "<div onmouseover='this.style.backgroundColor=\"#cccccc\";' onmouseout='this.style.backgroundColor=\"white\";' style='cursor:pointer;background-color:white;padding:2px;' onclick='EnFolks_get_object(\"EnFolksTermsPulldownClose\").style.display=\"none\";EnFolks_get_object(\"EnFolksTermsPulldown\").style.display=\"none\";EnFolks_get_object(\"EnergyFolksterms3\").checked=true;EnFolks_get_object(\"EnFolks_full_name2\").innerHTML=EnFolksLanguage.position_job_title;' id='EnFolks_position_job_title'>"+EnFolksLanguage.position_job_title+"</div>"
                + "<div onmouseover='this.style.backgroundColor=\"#cccccc\";' onmouseout='this.style.backgroundColor=\"white\";' style='cursor:pointer;background-color:white;padding:2px;' onclick='EnFolks_get_object(\"EnFolksTermsPulldownClose\").style.display=\"none\";EnFolks_get_object(\"EnFolksTermsPulldown\").style.display=\"none\";EnFolks_get_object(\"EnergyFolksterms2\").checked=true;EnFolks_get_object(\"EnFolks_full_name2\").innerHTML=EnFolksLanguage.company_organization;' id='EnFolks_company_organization'>"+EnFolksLanguage.company_organization+"</div>"
                + "<div onmouseover='this.style.backgroundColor=\"#cccccc\";' onmouseout='this.style.backgroundColor=\"white\";' style='cursor:pointer;background-color:white;padding:2px;' onclick='EnFolks_get_object(\"EnFolksTermsPulldownClose\").style.display=\"none\";EnFolks_get_object(\"EnFolksTermsPulldown\").style.display=\"none\";EnFolks_get_object(\"EnergyFolksterms4\").checked=true;EnFolks_get_object(\"EnFolks_full_name2\").innerHTML=EnFolksLanguage.energy_interests;' id='EnFolks_energy_interests'>"+EnFolksLanguage.energy_interests+"</div>"
                + "<div onmouseover='this.style.backgroundColor=\"#cccccc\";' onmouseout='this.style.backgroundColor=\"white\";' style='cursor:pointer;background-color:white;padding:2px;' onclick='EnFolks_get_object(\"EnFolksTermsPulldownClose\").style.display=\"none\";EnFolks_get_object(\"EnFolksTermsPulldown\").style.display=\"none\";EnFolks_get_object(\"EnergyFolksterms5\").checked=true;EnFolks_get_object(\"EnFolks_full_name2\").innerHTML=EnFolksLanguage.energy_expertise;' id='EnFolks_energy_expertise'>"+EnFolksLanguage.energy_expertise+"</div>"
                + "<div onmouseover='this.style.backgroundColor=\"#cccccc\";' onmouseout='this.style.backgroundColor=\"white\";' style='cursor:pointer;background-color:white;padding:2px;' onclick='EnFolks_get_object(\"EnFolksTermsPulldownClose\").style.display=\"none\";EnFolks_get_object(\"EnFolksTermsPulldown\").style.display=\"none\";EnFolks_get_object(\"EnergyFolksterms6\").checked=true;EnFolks_get_object(\"EnFolks_full_name2\").innerHTML=EnFolksLanguage.full_bio;' id='EnFolks_full_bio'>"+EnFolksLanguage.full_bio+"</div>"
                + "</div>";
        } else if(obj.type == "jobs") {
            var text="<div style='position:absolute;top;0px;height:26px;right:"+(right+128)+"px;width:39px;padding:0px;padding-top:2px;text-align:center;font-weight:normal;background-color:#e6e6e6;font-size:16px;background-image:url(https://images.energyfolks.com/images/fadebox/white/1.png);border:0px solid white;cursor:pointer;' onmouseover='this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/black/15.png)\";' onmouseout='if(this.style.fontWeight==\"bold\") this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/black/25.png)\"; else this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/white/1.png)\";' id='Enfolks_calmonthly'><img src='https://images.energyfolks.com/images/topbar/monthdark.png' border=0 class=inline></div>"
                + "<div style='position:absolute;top;0px;height:26px;right:"+(right+88)+"px;width:39px;padding:0px;padding-top:2px;text-align:center;font-weight:normal;background-color:#e6e6e6;font-size:16px;background-image:url(https://images.energyfolks.com/images/fadebox/white/1.png);border:0px solid white;cursor:pointer;' onmouseover='this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/black/15.png)\";' onmouseout='if(this.style.fontWeight==\"bold\") this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/black/25.png)\"; else this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/white/1.png)\";' id='Enfolks_calagenda'><img src='https://images.energyfolks.com/images/topbar/listdark.png' border=0 class=inline></div>"
                + "<div style='position:absolute;top;0px;height:26px;right:"+(right+48)+"px;width:39px;padding:0px;padding-top:2px;text-align:center;font-weight:normal;background-color:#e6e6e6;font-size:16px;background-image:url(https://images.energyfolks.com/images/fadebox/white/1.png);border:0px solid white;cursor:pointer;' onmouseover='this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/black/15.png)\";' onmouseout='if(this.style.fontWeight==\"bold\") this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/black/25.png)\"; else this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/white/1.png)\";' id='Enfolks_calmap'><img src='https://images.energyfolks.com/images/topbar/mapdark.png' border=0 class=inline></div>"
                + "<div style='position:absolute;top;0px;height:26px;right:"+(right)+"px;width:39px;padding:0px;padding-top:2px;text-align:center;font-weight:normal;background-color:#e6e6e6;font-size:16px;background-image:url(https://images.energyfolks.com/images/fadebox/white/1.png);border:0px solid white;cursor:pointer;' onmouseover='this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/black/15.png)\";' onmouseout='this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/white/1.png)\";' id='Enfolks_rss'><img src='https://images.energyfolks.com/images/topbar/rssdark.png' border=0 style='display:inline;'></div>";
            right+=178;
            text2+= "<div onmouseover='this.style.backgroundColor=\"#cccccc\";' onmouseout='this.style.backgroundColor=\"white\";' style='cursor:pointer;background-color:white;padding:2px;' onclick='EnFolks_get_object(\"EnFolksTermsPulldownClose\").style.display=\"none\";EnFolks_get_object(\"EnFolksTermsPulldown\").style.display=\"none\";EnFolks_get_object(\"EnergyFolksterms1\").checked=true;EnFolks_get_object(\"EnFolks_position_title2\").innerHTML=EnFolksLanguage.position_title;' id='EnFolks_position_title'>"+EnFolksLanguage.position_title+"</div>"
                + "<div onmouseover='this.style.backgroundColor=\"#cccccc\";' onmouseout='this.style.backgroundColor=\"white\";' style='cursor:pointer;background-color:white;padding:2px;' onclick='EnFolks_get_object(\"EnFolksTermsPulldownClose\").style.display=\"none\";EnFolks_get_object(\"EnFolksTermsPulldown\").style.display=\"none\";EnFolks_get_object(\"EnergyFolksterms2\").checked=true;EnFolks_get_object(\"EnFolks_position_title2\").innerHTML=EnFolksLanguage.employer;' id='EnFolks_employer'>"+EnFolksLanguage.employer+"</div>"
                + "<div onmouseover='this.style.backgroundColor=\"#cccccc\";' onmouseout='this.style.backgroundColor=\"white\";' style='cursor:pointer;background-color:white;padding:2px;' onclick='EnFolks_get_object(\"EnFolksTermsPulldownClose\").style.display=\"none\";EnFolks_get_object(\"EnFolksTermsPulldown\").style.display=\"none\";EnFolks_get_object(\"EnergyFolksterms3\").checked=true;EnFolks_get_object(\"EnFolks_position_title2\").innerHTML=EnFolksLanguage.Description;' id='EnFolks_Description'>"+EnFolksLanguage.Description+"</div>"
                + "<div onmouseover='this.style.backgroundColor=\"#cccccc\";' onmouseout='this.style.backgroundColor=\"white\";' style='cursor:pointer;background-color:white;padding:2px;' onclick='EnFolks_get_object(\"EnFolksTermsPulldownClose\").style.display=\"none\";EnFolks_get_object(\"EnFolksTermsPulldown\").style.display=\"none\";EnFolks_get_object(\"EnergyFolksterms4\").checked=true;EnFolks_get_object(\"EnFolks_position_title2\").innerHTML=EnFolksLanguage.Location;' id='EnFolks_Location'>"+EnFolksLanguage.Location+"</div>"
                + "</div>";
        } else if(obj.type == "announce") {
            var text="<div style='position:absolute;top;0px;height:26px;right:"+(right+128)+"px;width:39px;padding:0px;padding-top:2px;text-align:center;font-weight:normal;background-color:#e6e6e6;font-size:16px;background-image:url(https://images.energyfolks.com/images/fadebox/white/1.png);border:0px solid white;cursor:pointer;' onmouseover='this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/black/15.png)\";' onmouseout='if(this.style.fontWeight==\"bold\") this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/black/25.png)\"; else this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/white/1.png)\";' id='Enfolks_calmonthly'><img src='https://images.energyfolks.com/images/topbar/monthdark.png' border=0 class=inline></div>"
                + "<div style='position:absolute;top;0px;height:26px;right:"+(right+88)+"px;width:39px;padding:0px;padding-top:2px;text-align:center;font-weight:normal;background-color:#e6e6e6;font-size:16px;background-image:url(https://images.energyfolks.com/images/fadebox/white/1.png);border:0px solid white;cursor:pointer;' onmouseover='this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/black/15.png)\";' onmouseout='if(this.style.fontWeight==\"bold\") this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/black/25.png)\"; else this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/white/1.png)\";' id='Enfolks_calagenda'><img src='https://images.energyfolks.com/images/topbar/listdark.png' border=0 class=inline></div>"
                + "<div style='position:absolute;top;0px;height:26px;right:"+(right+48)+"px;width:39px;padding:0px;padding-top:2px;text-align:center;font-weight:normal;background-color:#e6e6e6;font-size:16px;background-image:url(https://images.energyfolks.com/images/fadebox/white/1.png);border:0px solid white;cursor:pointer;' onmouseover='this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/black/15.png)\";' onmouseout='if(this.style.fontWeight==\"bold\") this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/black/25.png)\"; else this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/white/1.png)\";' id='Enfolks_calstream'><img src='https://images.energyfolks.com/images/topbar/streamdark.png' border=0 class=inline></div>"
                + "<div style='position:absolute;top;0px;height:26px;right:"+(right)+"px;width:39px;padding:0px;padding-top:2px;text-align:center;font-weight:normal;background-color:#e6e6e6;font-size:16px;background-image:url(https://images.energyfolks.com/images/fadebox/white/1.png);border:0px solid white;cursor:pointer;' onmouseover='this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/black/15.png)\";' onmouseout='this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/white/1.png)\";' id='Enfolks_rss'><img src='https://images.energyfolks.com/images/topbar/rssdark.png' border=0 style='display:inline;'></div>";
            right+=178;
            text2 += "<div onmouseover='this.style.backgroundColor=\"#cccccc\";' onmouseout='this.style.backgroundColor=\"white\";' style='cursor:pointer;background-color:white;padding:2px;' onclick='EnFolks_get_object(\"EnFolksTermsPulldownClose\").style.display=\"none\";EnFolks_get_object(\"EnFolksTermsPulldown\").style.display=\"none\";EnFolks_get_object(\"EnergyFolksterms1\").checked=true;EnFolks_get_object(\"EnFolks_PostTitle2\").innerHTML=EnFolksLanguage.PostTitle;' id='EnFolks_PostTitle'>"+EnFolksLanguage.PostTitle+"</div>"
                + "<div onmouseover='this.style.backgroundColor=\"#cccccc\";' onmouseout='this.style.backgroundColor=\"white\";' style='cursor:pointer;background-color:white;padding:2px;' onclick='EnFolks_get_object(\"EnFolksTermsPulldownClose\").style.display=\"none\";EnFolks_get_object(\"EnFolksTermsPulldown\").style.display=\"none\";EnFolks_get_object(\"EnergyFolksterms2\").checked=true;EnFolks_get_object(\"EnFolks_PostTitle2\").innerHTML=EnFolksLanguage.PostText;' id='EnFolks_PostText'>"+EnFolksLanguage.PostText+"</div>"
                + "</div>";
        } else {
            var text="<div style='position:absolute;top;0px;height:26px;right:"+(right)+"px;width:39px;padding:0px;padding-top:2px;text-align:center;font-weight:normal;background-color:#e6e6e6;font-size:16px;background-image:url(https://images.energyfolks.com/images/fadebox/white/1.png);border:0px solid white;cursor:pointer;' onmouseover='this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/black/15.png)\";' onmouseout='this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/white/1.png)\";' id='Enfolks_rss'><img src='https://images.energyfolks.com/images/topbar/rssdark.png' border=0 style='display:inline;'></div>";
            right+=48;
            text2 += "<div onmouseover='this.style.backgroundColor=\"#cccccc\";' onmouseout='this.style.backgroundColor=\"white\";' style='cursor:pointer;background-color:white;padding:2px;' onclick='EnFolks_get_object(\"EnFolksTermsPulldownClose\").style.display=\"none\";EnFolks_get_object(\"EnFolksTermsPulldown\").style.display=\"none\";EnFolks_get_object(\"EnergyFolksterms1\").checked=true;EnFolks_get_object(\"EnFolks_PostTitle2\").innerHTML=EnFolksLanguage.PostTitle;' id='EnFolks_PostTitle'>"+EnFolksLanguage.PostTitle+"</div>"
                + "<div onmouseover='this.style.backgroundColor=\"#cccccc\";' onmouseout='this.style.backgroundColor=\"white\";' style='cursor:pointer;background-color:white;padding:2px;' onclick='EnFolks_get_object(\"EnFolksTermsPulldownClose\").style.display=\"none\";EnFolks_get_object(\"EnFolksTermsPulldown\").style.display=\"none\";EnFolks_get_object(\"EnergyFolksterms2\").checked=true;EnFolks_get_object(\"EnFolks_PostTitle2\").innerHTML=EnFolksLanguage.PostText;' id='EnFolks_PostText'>"+EnFolksLanguage.PostText+"</div>"
                + "</div>";
        }
        text+="<div style='height:26px;position:absolute;top:0px;left:120px;right:"+(right+23)+"px;border: 0px solid #e6e6e6;border-top-width:1px;border-bottom-width:1px;overflow:hidden;text-align:left;padding:0px;margin:0px;'><form name='EnergyFolkstermsform' id='EnergyFolkstermsform' style='margin:2px;padding:0px;'><input type=text name='EnergyFolksterms' id='EnergyFolksterms' value='"+EnFolksLanguage.search+"' style='height:24px;width:2000px;margin:0px;padding:0px;border:0px solid black;font-size:16px;color:#bbbbbb;' onblur='if(this.value == \"\") { this.style.color=\"#bbbbbb\";this.value=EnFolksLanguage.search; }' onfocus='if(this.value == EnFolksLanguage.search) { this.style.color=\"black\";this.value=\"\"; }'><span style='display:none;'><input type=submit></span></form></div>"
            + "<div style='height:26px;width:23px;position:absolute;top:0px;right:"+right+"px;cursor:pointer;border:1px solid #e6e6e6;border-left-width:0px;text-align:center;vertical-align:middle;'  onmouseover='this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/white/1.png)\";' onmouseout='this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/white/25.png)\";' id='EnergyFolksSubmitIcon'><img src='https://images.energyfolks.com/images/topbar/searchdark.png' border=0 style='display:inline;padding-top:2px;'></div>";
        if(obj.ShowCreateNewOnBar)
            text += "<div style='height:24px;padding-top:4px;width:92px;position:absolute;top:0px;right:0px;cursor:pointer;background-color:#e6e6e6;background-image:url(https://images.energyfolks.com/images/fadebox/white/1.png);border:0px solid white;border-left-width:1px;text-align:center;vertical-align:middle;font-size:10px;color:#606060;font-weight:normal;'  onmouseover='this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/black/15.png)\";' onmouseout='this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/white/1.png)\";' id='EnFolksNewPostButtonIcon'><span id='EnFolks_post_item'>"+EnFolksLanguage.post_item+"</span> <img src='https://images.energyfolks.com/images/topbar/uploaddark.png' border=0 align=absmiddle style='display:inline;'></div>";
        text+= "<div style='height:500px;position:absolute;top:-100px;left:-100px;width:340px;display:none;' id='EnFolksTermsPulldownClose' onmouseover='EnFolks_get_object(\"EnFolksTermsPulldownClose\").style.display=\"none\";EnFolks_get_object(\"EnFolksTermsPulldown\").style.display=\"none\";'>"
            + "</div><div style='height:24px;position:absolute;top:0px;left:0px;width:100px;padding-right:20px;padding-top:4px;text-align:center;vertical-align:middle;font-weight:normal;color:#606060;font-size:14px;background-image:url(https://images.energyfolks.com/images/fadebox/white/1.png);cursor:pointer;border:0px solid white;background-color:#e6e6e6;' onmouseover='this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/black/15.png)\";' onmouseout='this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/white/1.png)\";'  onclick='EnFolks_get_object(\"EnFolksTermsPulldown\").style.display=\"block\";EnFolks_get_object(\"EnFolksTermsPulldownClose\").style.display=\"block\";'>";
        if(obj.type == "calendar")
            text += "<span id='EnFolks_EventTitle2'>" + EnFolksLanguage.EventTitle + "</span>";
        else if(obj.type == "jobs")
            text += "<span id='EnFolks_position_title2'>" + EnFolksLanguage.position_title + "</span>";
        else if(obj.type == "users")
            text += "<span id='EnFolks_full_name2'>" + EnFolksLanguage.full_name + "</span>";
        else
            text += "<span id='EnFolks_PostTitle2'>" + EnFolksLanguage.PostTitle + "</span>";
        text += "</div><div style='position:absolute;top:12px;height:6px;left:106px;padding:0px;margin:0px;'><img src='https://images.energyfolks.com/images/downarrowdark.png' border=0 style='display:block;padding:0px;margin:0px;'></div>";
        if((obj.type == 'announce') && !obj.longformat) {
            var ntext="<div style='display:none;padding:5px;' id='EnFolksStreamPost'></div>";
            ntext+="<div style='display:block;height:40px;position:relative;cursor:pointer;' id='EnFolksNewPostButtonStream' onclick=''>";
            ntext+="<div style='position:absolute;top:5px;bottom:5px;left:5px;right:150px;border:1px solid #cccccc;padding:3px;color:#bbbbbb;background-color:white;'>Click to add a post...</div><div style='position:absolute;top:5px;bottom:5px;right:5px;width:140px;border:1px solid black;background-color:#"+EnFolks_Default_Color+";text-align:center;color:white;font-size:12px;padding-top:5px;'>Add Post</div></div>";
            EnFolks_get_object('EnFolksPostDiv').innerHTML=ntext;
            EnFolks_get_object('EnFolksPostDiv').style.display='block';
            EnFolks_get_object('EnFolksNewPostButtonStream').onclick=function(obj){return function(){
                EnFolks_get_object('EnFolksNewPostButtonStream').style.display="none";EnFolks_get_object("EnFolksStreamPost").style.display="block";EnFolks_get_object("EnFolksStreamPost").innerHTML="<iframe src=\"https://www.energyfolks.com/announce/externalpostStream/"+obj.affiliateid+"/"+obj.ThreadValue+"\" frameborder=0 style=\"width:610px;border-width:0px;height:360px;\" id=\"EnFolksStreamPostIframe\"></iframe>";EnFolks_get_object("EnFolksStreamPostIframe").focus();
                return false;};}(obj);
        }
        EnFolks_get_object('EnFolkSBarNew').innerHTML=text+text2;
        if(!ShowSearch) EnFolks_get_object('EnFolkSBarNew').style.display='none';
        if(EnFolks_get_object("EnergyFolkstermsform"))
            EnFolks_get_object("EnergyFolkstermsform").onsubmit=function(obj){return function(){obj.FilterResults();return false;};}(obj);
        if(EnFolks_get_object("EnergyFolksSubmitIcon"))
            EnFolks_get_object("EnergyFolksSubmitIcon").onclick=function(obj){return function(){obj.FilterResults();return false;};}(obj);
        if(EnFolks_get_object('EnFolksNewPostButtonIcon'))
            EnFolks_get_object('EnFolksNewPostButtonIcon').onclick=function(obj){return function(){EnFolksMessageSize("https://www.energyfolks.com/" + obj.type + "/externalpost/"+obj.affiliateid+"/"+obj.ThreadValue,1050,575);return false;};}(obj);

        if(obj.type == 'calendar') {
            //if(obj.showWarning)
            //    text += "<div style='display:none;position:absolute;top;0px;height:28px;right:180px;width:149px;padding:0px;padding-top:2px;text-align:center;font-weight:normal;color:#ffffff;font-size:10px;background-image:url(https://images.energyfolks.com/images/fadebox/white/25.png);border:0px solid white;border-left-width:1px;cursor:pointer;' onmouseover='this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/white/1.png)\";' onmouseout='this.style.backgroundImage=\"url(https://images.energyfolks.com/images/fadebox/white/25.png)\";' id='EnFolksWarningBarLink' onclick='EnFolks_get_object(\"EnFolksWarningBar\").style.display=\"block\";'><span id='EnFolks_show_restricted_content'>"+EnFolksLanguage.show_restricted_content+"</span></div>";
            //text += "<div id='EnFolkslinkfadediv'></div>";
            //if(obj.showWarning)
            //    text+="<div id='EnFolksWarningBar' style='z-index:99;display:none;font-size:15px;font-style:italic;text-align:left;position:absolute;top:0px;left:0px;right:0px;background-color:white;border:1px solid black;'></div>";
            //EnFolks_get_object(obj.div_name+'linkbar').innerHTML=text;
            EnFolks_get_object("Enfolks_calmonthly").onclick=function(obj){return function() {obj.DisplayMonthly([0,0]);obj.TopBarHighlight();return false;};}(obj);
            EnFolks_get_object("Enfolks_calweekly").onclick=function(obj){return function() {obj.DisplayWeekly(0);obj.TopBarHighlight();return false;};}(obj);
            EnFolks_get_object("Enfolks_calagenda").onclick=function(obj){return function() {obj.DisplayDataList([-1,10]);obj.TopBarHighlight();return false;};}(obj);
            EnFolks_get_object("Enfolks_calmap").onclick=function(obj){return function() {obj.DisplayMap(-1);obj.TopBarHighlight();return false;};}(obj);
            EnFolks_get_object("Enfolks_rss").onclick=function(obj){return function() {obj.GetRSS();return false;};}(obj);
            EnFolks_get_object("Enfolks_ical").onclick=function(obj){return function() {EnFolksMessage("https://www.energyfolks.com/calendar/subscribenon/"+obj.affiliateid);return false;};}(obj);
            obj.TopBarHighlight();
        } else if(obj.type == "jobs") {
            if(ShowSearch) {
                EnFolks_get_object("EnFolksSelectThread").innerHTML="<a href='javascript:;' id='EnFolksSelectThreadLink'>&laquo; Back to Regions</a></div>";
                EnFolks_get_object("EnFolksSelectThread").style.display='block';
            }
            if(EnFolks_get_object("EnFolksSelectThreadLink"))
                EnFolks_get_object("EnFolksSelectThreadLink").onclick=function(obj){return function() {obj.SelectThread();return false;};}(obj);
            //EnFolks_get_object(obj.div_name+'linkbar').innerHTML=text;
            EnFolks_get_object("Enfolks_calmonthly").onclick=function(obj){return function() {obj.DisplayMonthly([0,0]);obj.TopBarHighlight();return false;};}(obj);
            EnFolks_get_object("Enfolks_calagenda").onclick=function(obj){return function() {obj.DisplayDataList([0,10]);obj.TopBarHighlight();return false;};}(obj);
            EnFolks_get_object("Enfolks_calmap").onclick=function(obj){return function() {obj.DisplayMap(-1);obj.TopBarHighlight();return false;};}(obj);
            EnFolks_get_object("Enfolks_rss").onclick=function(obj){return function() {obj.GetRSS();return false;};}(obj);
            obj.TopBarHighlight();
        } else if(obj.type == "announce") {
            if(ShowSearch) {
                EnFolks_get_object("EnFolksSelectThread").innerHTML="<a href='javascript:;' id='EnFolksSelectThreadLink'>&laquo; Back to Threads</a></div>";
                EnFolks_get_object("EnFolksSelectThread").style.display='block';
            }
            //EnFolks_get_object(obj.div_name+'linkbar').innerHTML=text;
            EnFolks_get_object("Enfolks_rss").onclick=function(obj){return function() {obj.GetRSS();return false;};}(obj);
            EnFolks_get_object("Enfolks_calmonthly").onclick=function(obj){return function() {obj.BulletinSwitch(0,1);obj.TopBarHighlight();return false;};}(obj);
            EnFolks_get_object("Enfolks_calagenda").onclick=function(obj){return function() {obj.BulletinSwitch(0,0);obj.TopBarHighlight();return false;};}(obj);
            EnFolks_get_object("Enfolks_calstream").onclick=function(obj){return function() {obj.BulletinSwitch(1,0);obj.TopBarHighlight();return false;};}(obj);
            if(EnFolks_get_object("EnFolksSelectThreadLink"))
                EnFolks_get_object("EnFolksSelectThreadLink").onclick=function(obj){return function() {obj.SelectThread();return false;};}(obj);
            obj.TopBarHighlight();
        } else if(obj.type == "users") {
            if(!ShowSearch) EnFolks_get_object(obj.div_name+'linkbar').style.display='none';
            if(obj.ShowNetwork) {
                EnFolks_get_object("EnFolksSelectThread").innerHTML="<a href='javascript:;' id='EnFolksSelectThreadLink'>&laquo; Back to Networks</a></div>";
                EnFolks_get_object("EnFolksSelectThread").style.display='block';
            }
            if(EnFolks_get_object("EnFolksSelectThreadLink"))
                EnFolks_get_object("EnFolksSelectThreadLink").onclick=function(obj){return function() {obj.SelectThread();return false;};}(obj);
        } else {
            EnFolks_get_object("Enfolks_rss").onclick=function(obj){return function() {obj.GetRSS();return false;};}(obj);
        }
        if(EnFolks_get_object("EnFolksRegionLink")) {
            EnFolks_get_object("EnFolksRegionLink").onclick=function(obj){return function() {obj.ResetRegion();};}(obj);
            //if(obj.type == 'users') EnFolks_get_object("EnFolksRegionPicker").style.display='none';
            //EnFolks_get_object("EnFolksLangLink").onclick=function(obj){ return function() {obj.ResetLanguage();};}(obj);
        }
        if (obj.isHashChangeSupported()) {
            if (window.addEventListener){
                window.addEventListener('hashchange', function(obj){return function() {obj.CheckForBackForth();return false;};}(obj), false);
            } else if (window.attachEvent){
                window.attachEvent('onhashchange', function(obj){return function() {obj.CheckForBackForth();return false;};}(obj));
            }
            window.setTimeout(function(obj){return function() {obj.CheckForBackForth();return false;};}(obj),100);
        } else
            window.setInterval(function(obj){return function() {obj.CheckForBackForth();return false;};}(obj),300);
        if(typeof google === 'undefined') { //Google maps API v3 loaded?  if not...go get it
            var script = document.createElement("script");
            script.type = "text/javascript";
            script.src = "https://maps-api-ssl.google.com/maps/api/js?v=3&sensor=false&callback=EFMAPinitialize";
            document.body.appendChild(script);
        }
        if(typeof gapi === 'undefined') {
            window.___gcfg = {
                lang: 'en-US',
                parsetags: 'explicit'
            };
            (function() {
                var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
                po.src = 'https://apis.google.com/js/plusone.js';
                var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
            })();
        }
    };}(this,window.onload);
}
var EF_Goog_loaded=false;
function EFMAPinitialize() {
    EF_Goog_loaded=true;
}
EnergyFolks.prototype.DisableFixedSearchBar = function() {
    this.FixBar=false;
}
EnergyFolks.prototype.isHashChangeSupported = function() {
    var eventName = 'onhashchange';
    var isSupported = (eventName in document.body);
    if (!isSupported) {
        document.body.setAttribute(eventName, 'return;');
        isSupported = typeof document.body[eventName] == 'function';
    }

    // documentMode logic from YUI to filter out IE8 Compat Mode (which
    // generates false positives).
    return isSupported && (document.documentMode === undefined ||
        document.documentMode > 7);
}
var EnFolksAffiliateId="0";
EnergyFolks.prototype.SetAffiliate = function(id) {
    this.affiliateid=""+id;
    EnFolksAffiliateId=""+id;
}
EnergyFolks.prototype.ResetRegion = function() {
    EnFolks_get_object("EnfolksResultDiv").innerHTML="<div align=center><img src='https://images.energyfolks.com/images/loader.gif'><h2>"+EnFolksLanguage.loading+"...</h2></div>";
    this.AjaxRequest("https://www.energyfolks.com/welcome/SetZone/0");
    url="https://www.energyfolks.com/"+this.type+"/NoZone/"+this.affiliateid+"/";
    this.data_loaded=false;
    EnergyFolks_awaiting_data=true;
    this.AjaxRequest(url);
    window.setTimeout(function(obj){return function(){obj.SearchWaiter();};}(this),"50");
}
EnergyFolks.prototype.ResetLanguage = function() {
    EnFolks_get_object("EnfolksResultDiv").innerHTML="<div align=center><img src='https://images.energyfolks.com/images/loader.gif'><h2>"+EnFolksLanguage.loading+"...</h2></div>";
    url="https://www.energyfolks.com/welcome/ChooseLang/";
    this.data_loaded=false;
    EnergyFolks_awaiting_data=true;
    this.AjaxRequest(url);
    window.setTimeout(function(obj){return function(){obj.SearchWaiter();};}(this),"50");
}
EnergyFolks.prototype.HideWarning = function() {
    this.showWarning=false;
}
EnergyFolks.prototype.SetLoginURL = function(url) {
    this.LocalLoginURL=url;
}
EnergyFolks.prototype.GetRSS = function() {
    if(this.affiliateid != "") {
        var tex="<h1>Choose your feed</h1><ul>";
        if(this.type=='calendar') {
            tex+="<li><a href='https://www.energyfolks.com/"+this.type+"/rss/"+EnFolks_Zone+"/"+this.affiliateid+"' target='_blank'>All upcoming events in this region</a></li>";
            tex+="<li><a href='https://www.energyfolks.com/"+this.type+"/rss/"+EnFolks_Zone+"/"+this.affiliateid+"/1' target='_blank'>All upcoming events in this region from "+EnFolksPartners[this.affiliateid*1]+"</a></li></ul>";
        }
        if(this.type=='jobs') {
            tex+="<li><a href='https://www.energyfolks.com/"+this.type+"/rss/"+this.ThreadValue+"/"+this.affiliateid+"' target='_blank'>All recent job posts in this region</a></li>";
            tex+="<li><a href='https://www.energyfolks.com/"+this.type+"/rss/"+this.ThreadValue+"/"+this.affiliateid+"/1' target='_blank'>All recent job posts in this region from "+EnFolksPartners[this.affiliateid*1]+"</a></li></ul>";
        }
        if(this.type=='announce') {
            tex+="<li><a href='https://www.energyfolks.com/"+this.type+"/rss/"+this.ThreadValue+"/"+this.affiliateid+"' target='_blank'>All recent posts in this thread</a></li>";
            tex+="<li><a href='https://www.energyfolks.com/"+this.type+"/rss/"+this.ThreadValue+"/"+this.affiliateid+"/1' target='_blank'>All recent posts in this thread from "+EnFolksPartners[this.affiliateid*1]+"</a></li></ul>";
        }
        if(this.type=='blog') {
            tex+="<li><a href='https://www.energyfolks.com/"+this.type+"/rss/0' target='_blank'>All recent posts</a></li>";
            if(this.ThreadValue > 0)
                tex+="<li><a href='https://www.energyfolks.com/"+this.type+"/rss/"+this.ThreadValue+"' target='_blank'>All recent posts from "+EnFolksPartners[this.ThreadValue*1]+"</a></li></ul>";
            else
                tex+="<li><a href='https://www.energyfolks.com/"+this.type+"/rss/"+this.affiliateid+"' target='_blank'>All recent posts from "+EnFolksPartners[this.affiliateid*1]+"</a></li></ul>";
        }
        tex+="<i>Note: details will only be shown for public posts in the RSS feed</i>";
        EnFolksMessageDirect("<div style='text-align:left;'>"+tex+"</div>",400,400);
        EnFolks_get_object('EnFolks_message2').style.display='none';
        EnFolks_get_object('EnFolks_message').style.display='block';
    } else {
        if(this.type=='calendar')
            window.open("https://www.energyfolks.com/"+this.type+"/rss/"+EnFolks_Zone);
        else
            window.open("https://www.energyfolks.com/"+this.type+"/rss/"+this.ThreadValue);
    }
}
EnergyFolks.prototype.SetRegion = function(id) {
    this.AjaxRequest("https://www.energyfolks.com/welcome/SetZone/"+id);
}
EnergyFolks.prototype.RestrictToAffiliate = function(id) {
    this.ShowNetwork=false;
    if(id > 0)
        this.SetAffiliate=id;
    if(this.type == "users") {
        this.ThreadValue=this.SetAffiliate;
    } else {
        this.RestrictValue=1;
    }
}
EnergyFolks.prototype.RestrictToHighlighted = function(id) {
    this.ShowNetwork=false;
    if(id > 0)
        this.SetAffiliate=id;
    this.RestrictValue=2;
}
EnergyFolks.prototype.AnnounceOnly = function() {
    this.ThreadValue=1;
}
EnergyFolks.prototype.FeaturedOnly = function() {
    this.ThreadValue=2;
}
EnergyFolks.prototype.BusinessIdeas = function() {
    this.ThreadValue=8;
}
EnergyFolks.prototype.RestrictToThread = function(v) {
    this.ThreadValue=v;
}
EnergyFolks.prototype.SetColor = function(color) {
    EnFolks_Default_Color=color;
}
EnergyFolks.prototype.HideFeedback = function() { //BACKWARDS COMPATIBILITY
    this.ShowFeedback=false;
}
EnergyFolks.prototype.MakeFeedbackWhite = function() {
    this.MakeFeedbackColorWhite=true;
}
EnergyFolks.prototype.RestrictToSponsor = function(id) {
    if(this.type == "calendar")
        this.initial_filters.push({type:"sponsor",id:id});
}
EnergyFolks.prototype.RestrictToSeries = function(id) {
    if(this.type == "calendar")
        this.initial_filters.push({type:"series",id:id});
}
EnergyFolks.prototype.SearchBarFixed = function() {
    if(this.inDetail) return;
    var box=EnFolks_get_object("EnergyFolksSearchBarBox");
    var WindowY=EnFolksScrollTop();
    var basepos=this.getAnchorPosition('EnergyFolksSearchBarBox');
    var basepos2=this.getAnchorPosition('EnFolks_bottomimg');
    var newY=Math.max(1,Math.min(WindowY-(basepos.y-5),basepos2.y-400));
    if(EnFolks_get_object("efadminbar")) if(EnFolks_get_object("efadminbar").style.position=='fixed') newY+=28;
    if(EnFolks_get_object("wpadminbar")) newY+=28;
    box.style.height=newY+'px';
    if(newY > 35) {
        var totop=EnFolks_get_object("EnFolks_back_to_top");
        if(totop.style.display='none') {
            var l_pos=this.getAnchorPosition(this.div_name);
            var w=EnFolks_getdimension(this.div_name);
            totop.style.left=l_pos.x+"px";
            if(EnFolks_get_object("efadminbar")) if(EnFolks_get_object("efadminbar").style.position=='fixed') totop.style.top='28px';
            if(EnFolks_get_object("wpadminbar")) totop.style.top='28px';
            totop.style.width=(w.width-8)+"px";
            totop.style.display='block';
        }
    } else EnFolks_get_object("EnFolks_back_to_top").style.display='none';
}
EnergyFolks.prototype.ShowSearchBar = function() {
    /*
     Run this function if you wish to display the 'search' bar.  Run this function at the place in your HTML file
     where you want the searchbar to appear
     */
    document.write("<div style='padding:0px;margin:0px;line-height:1px;'><img id='EnergyFolksSearchBarBox' src='https://images.energyfolks.com/images/blank.gif' style='height:1px;width:1px;border:0px solid black;'></div><form onsubmit='EnFolks_get_object(\"EnergyFolksSubmit\").click();return false;' name=EnergyFolkssearchform id=EnergyFolkssearchform><button type=submit id='EnergyFolksSubmit' name='EnergyFolksSubmit' style='display:none;'></button><div id='EnergyFolksSearchBar'></div></form>");
    wide=150;
    high=200;
    EnFolks_get_object('EnergyFolksSearchBar').innerHTML='<div align=center><table border=0 width=' + wide + ' cellpadding=0 cellspacing=0><tr><td rowspan=2><img src=https://images.energyfolks.com/images/blank.gif style="display:block;" height=' + high + ' width=1 border=0></td><td height=200 align=center><h5>'+EnFolksLanguage.loading+'...</h5><img class="inline" src="https://images.energyfolks.com/images/loader.gif" border=0></td></tr></table></div>';
    this.loadbar=true;
}
var EnFolks_Commentdata=new Array();
function dump(arr,level) {
    var dumped_text = "";
    if(!level) level = 0;

    //The padding given at the beginning of the line.
    var level_padding = "";
    for(var j=0;j<level+1;j++) level_padding += "    ";

    if(typeof(arr) == 'object') { //Array/Hashes/Objects
        for(var item in arr) {
            var value = arr[item];

            if(typeof(value) == 'object') { //If it is an array,
                dumped_text += level_padding + "'" + item + "' ...\n";
                dumped_text += dump(value,level+1);
            } else {
                dumped_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
            }
        }
    } else { //Stings/Chars/Numbers etc.
        dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
    }
    return dumped_text;
}
EnergyFolks.prototype.CheckForBackForth = function() {
    var curhash=window.location.hash.replace("#","");
    if(curhash != this.lasthash) {
        if(curhash.search("reviewdone")>-1) return;
        if(curhash.search("reviewJSdone")>-1) return;
        if(curhash.search("reviewJS2done")>-1) {
            var revid=window.location.hash.split("_");
            var WindowY=EnFolksScrollTop();
            window.location.hash='';
            window.scrollTo(0,WindowY);
            revid[1]=revid[1]*1;
            var dataset=new Array(new Array(EnFolks_Commentdata));
            if(revid[1] < 0) {
                revid[1]=revid[1]*-1;
                EnFolks_get_object("tabcommentboxrrm"+revid[1]).style.display="none";
                EnFolks_get_object("newcommentboxrrm"+revid[1]).innerHTML+=this.ReviewHTML(dataset,EnFolks_Commentdata.announce_id,true);
            } else {
                EnFolks_get_object("tabcommentboxrr"+revid[1]).style.display="none";
                EnFolks_get_object("newcommentboxrr"+revid[1]).innerHTML+=this.ReviewHTML(dataset,EnFolks_Commentdata.announce_id,false);
            }
            return;
        }
        if(curhash.search("ThreadDet")>-1) {
            this.BackToResults();
            var revid=curhash.split("_");
            if(revid.length == 2) {
                var id=revid[1]*1;
                this.ChooseThread(id);
            }
            return;
        }
        if(curhash.search("loaddone")>-1) {
            var WindowY=EnFolksScrollTop();
            window.location.hash=this.lasthash;
            EnFolks_get_object('EnFolks_message2').style.display='none';
            EnFolks_get_object('EnFolks_message').style.display='block';
            window.scrollTo(0,WindowY);
            return;
        }
        EnFolks_closemessage();
        if(curhash.search("closewindow")>-1) {
            var revid=curhash.split("_");
            if(revid.length == 2) {
                var id=revid[1]*1;
                if(EnFolks_get_object('table'+id)) {
                    EnFolks_get_object('table'+id).innerHTML="<div style='text-align:center;'><h2>Updating Post</h2><img style='display:inline;' src='https://images.energyfolks.com/images/loader.gif'></div>";
                    window.setTimeout(function(id) {return function() {EnFolks_get_object('table'+id).style.display='none';};}(id),250);
                    this.BackToResults();
                }
                if(this.LoadedDetail) alert('Post Updated');
                var len=this.full_data.length;
                for(var i=0;i<len;i++) {
                    if(this.full_data[i].id == id) {
                        this.full_data[i].type=-1;
                        break;
                    }
                }
                //this.FilterResults();
            }
            var WindowY=EnFolksScrollTop();
            window.location.hash=this.lasthash;
            window.scrollTo(0,WindowY);
            return;
        }
        this.lasthash=curhash;
        var todo=this.lasthash.replace("#","").replace("ItemDetail","").replace("EnFolksDetail","");
        if(todo == "") {
            if((this.type == "announce") || (this.type == 'jobs'))
                this.SelectThread();
            else
                this.BackToResults();
        } else
            this.ShowDetails(todo*1,0);
    }
}
EnergyFolks.prototype.PerformInitialFilter = function() {
    for(var i=0;i<this.initial_filters.length;i++) {
        if(this.initial_filters[i].type == 'sponsor') {
            var selObj = EnFolks_get_object('EnergyFolksSponsor');
            k=0;
            while(true) {
                if(selObj.options[k]) {
                    if((selObj.options[k].value*1) == this.initial_filters[i].id)
                        selObj.options[k].selected=true;
                    else
                        selObj.options[k].selected=false;
                } else break;
                k++;
            }
        }else if(this.initial_filters[i].type == 'series') {
            var selObj = EnFolks_get_object('EnergyFolksSeriesSelect');
            k=0;
            while(true) {
                if(selObj.options[k]) {
                    if((selObj.options[k].value*1) == this.initial_filters[i].id)
                        selObj.options[k].selected=true;
                    else
                        selObj.options[k].selected=false;
                } else break;
                k++;
            }
        }else if(this.initial_filters[i].type == 'type_uncheck_all') {
            var tot=EnFolks_get_object("EnergyFolkstypetotal").value;
            for(var j=0;j<tot;j++)
                EnFolks_get_object("EnergyFolkstype"+j).checked=false;
        } else if(this.initial_filters[i].type == 'type_check') {
            EnFolks_get_object("EnergyFolkstype"+this.initial_filters[i].id).checked=true;
        } else if(this.initial_filters[i].type == 'type_uncheck') {
            EnFolks_get_object("EnergyFolkstype"+this.initial_filters[i].id).checked=false;
        }
    }
}
EnergyFolks.prototype.AttachSearchBar = function() {
    if(EnFolks_get_object("EnergyFolksSubmit"))
        EnFolks_get_object("EnergyFolksSubmit").onclick=function(obj){return function(){obj.FilterResults();return false;};}(this);
    if(EnFolks_get_object('EnFolksNewPostButton'))
        EnFolks_get_object('EnFolksNewPostButton').onclick=function(obj){return function(){EnFolksMessageSize("https://www.energyfolks.com/" + obj.type + "/externalpost/"+obj.affiliateid+"/"+obj.ThreadValue,1050,575);return false;};}(this);
    if(EnFolks_get_object("EnFolksLoginSearch"))
        EnFolks_get_object("EnFolksLoginSearch").href=this.LocalLoginURL;
    for(var i=0;i < 100;i++) {
        if(EnFolks_get_object("EnFolks_Select_ThreadBar"+i))
            EnFolks_get_object("EnFolks_Select_ThreadBar"+i).onclick=function(obj,input) {return function() {obj.ChooseThread(input);};}(this,i);
    }
    if(EnFolks_get_object("EnFolksData0")) {
        EnFolks_get_object("EnFolksData0").onclick=function(obj) { return function() { EnFolks_get_object("EnFolksData0").style.backgroundColor='#999999';EnFolks_get_object("EnFolksData1").style.backgroundColor='transparent';EnFolks_get_object("EnFolksData2").style.backgroundColor='transparent';EnFolks_get_object("EnFolksData0").style.fontWeight='bold';EnFolks_get_object("EnFolksData1").style.fontWeight='normal';EnFolks_get_object("EnFolksData2").style.fontWeight='normal';obj.RestrictValue=0; if(obj.streamFormat) obj.ChooseThreadStream(obj.ThreadValue); else obj.FilterResults();return false; }; }(this);
        EnFolks_get_object("EnFolksData1").onclick=function(obj) { return function() { EnFolks_get_object("EnFolksData1").style.backgroundColor='#999999';EnFolks_get_object("EnFolksData0").style.backgroundColor='transparent';EnFolks_get_object("EnFolksData2").style.backgroundColor='transparent';EnFolks_get_object("EnFolksData1").style.fontWeight='bold';EnFolks_get_object("EnFolksData0").style.fontWeight='normal';EnFolks_get_object("EnFolksData2").style.fontWeight='normal';obj.RestrictValue=1; if(obj.streamFormat) obj.ChooseThreadStream(obj.ThreadValue); else obj.FilterResults();return false; }; }(this);
        EnFolks_get_object("EnFolksData2").onclick=function(obj) { return function() { EnFolks_get_object("EnFolksData2").style.backgroundColor='#999999';EnFolks_get_object("EnFolksData1").style.backgroundColor='transparent';EnFolks_get_object("EnFolksData0").style.backgroundColor='transparent';EnFolks_get_object("EnFolksData2").style.fontWeight='bold';EnFolks_get_object("EnFolksData1").style.fontWeight='normal';EnFolks_get_object("EnFolksData0").style.fontWeight='normal';obj.RestrictValue=2; if(obj.streamFormat) obj.ChooseThreadStream(obj.ThreadValue); else obj.FilterResults();return false; }; }(this);
    }
    if(EnFolks_get_object("EnFolksRSVP0")) {
        EnFolks_get_object("EnFolksRSVP0").onclick=function(obj) { return function() { EnFolks_get_object("EnFolksRSVP0").style.backgroundColor='#999999';EnFolks_get_object("EnFolksRSVP1").style.backgroundColor='transparent';EnFolks_get_object("EnFolksRSVP2").style.backgroundColor='transparent';EnFolks_get_object("EnFolksRSVP0").style.fontWeight='bold';EnFolks_get_object("EnFolksRSVP1").style.fontWeight='normal';EnFolks_get_object("EnFolksRSVP2").style.fontWeight='normal'; EnFolks_get_object('EnfolksShowRSVPNo').checked=true; obj.FilterResults();return false; }; }(this);
        EnFolks_get_object("EnFolksRSVP1").onclick=function(obj) { return function() { EnFolks_get_object("EnFolksRSVP1").style.backgroundColor='#999999';EnFolks_get_object("EnFolksRSVP0").style.backgroundColor='transparent';EnFolks_get_object("EnFolksRSVP2").style.backgroundColor='transparent';EnFolks_get_object("EnFolksRSVP1").style.fontWeight='bold';EnFolks_get_object("EnFolksRSVP0").style.fontWeight='normal';EnFolks_get_object("EnFolksRSVP2").style.fontWeight='normal'; EnFolks_get_object('EnfolksShowRSVPearly').checked=true; obj.FilterResults();return false; }; }(this);
        EnFolks_get_object("EnFolksRSVP2").onclick=function(obj) { return function() { EnFolks_get_object("EnFolksRSVP2").style.backgroundColor='#999999';EnFolks_get_object("EnFolksRSVP1").style.backgroundColor='transparent';EnFolks_get_object("EnFolksRSVP0").style.backgroundColor='transparent';EnFolks_get_object("EnFolksRSVP2").style.fontWeight='bold';EnFolks_get_object("EnFolksRSVP1").style.fontWeight='normal';EnFolks_get_object("EnFolksRSVP0").style.fontWeight='normal'; EnFolks_get_object('EnfolksShowRSVP').checked=true; obj.FilterResults();return false; }; }(this);
        EnFolks_get_object("EnFolksRSVP0").style.backgroundColor='#999999';
        EnFolks_get_object("EnFolksRSVP0").style.fontWeight='bold';
    }
    if((this.RestrictValue == 0) && EnFolks_get_object("EnFolksData0")) {
        EnFolks_get_object("EnFolksData0").style.backgroundColor='#999999';EnFolks_get_object("EnFolksData1").style.backgroundColor='transparent';EnFolks_get_object("EnFolksData2").style.backgroundColor='transparent';EnFolks_get_object("EnFolksData0").style.fontWeight='bold';EnFolks_get_object("EnFolksData1").style.fontWeight='normal';EnFolks_get_object("EnFolksData2").style.fontWeight='normal';
    }
    if((this.RestrictValue == 1) && EnFolks_get_object("EnFolksData1")) {
        EnFolks_get_object("EnFolksData1").style.backgroundColor='#999999';EnFolks_get_object("EnFolksData0").style.backgroundColor='transparent';EnFolks_get_object("EnFolksData2").style.backgroundColor='transparent';EnFolks_get_object("EnFolksData1").style.fontWeight='bold';EnFolks_get_object("EnFolksData0").style.fontWeight='normal';EnFolks_get_object("EnFolksData2").style.fontWeight='normal';
    }
    if((this.RestrictValue == 2) && EnFolks_get_object("EnFolksData2")) {
        EnFolks_get_object("EnFolksData2").style.backgroundColor='#999999';EnFolks_get_object("EnFolksData1").style.backgroundColor='transparent';EnFolks_get_object("EnFolksData0").style.backgroundColor='transparent';EnFolks_get_object("EnFolksData2").style.fontWeight='bold';EnFolks_get_object("EnFolksData1").style.fontWeight='normal';EnFolks_get_object("EnFolksData0").style.fontWeight='normal';
    }
    if(EnFolks_get_object("EnFolksThreadsVals")) {
        var vals=EnFolks_get_object("EnFolksThreadsVals").value.split(",");
        for(var i=0;i<vals.length;i++) {
            EnFolks_get_object("EnFolksThreads"+vals[i]).onclick=function(obj,id) {return function() {obj.ChooseThreadStream(id);};}(this,vals[i]);
            EnFolks_get_object("EnFolksThreads"+vals[i]).style.fontWeight='normal';
            EnFolks_get_object("EnFolksThreads"+vals[i]).style.backgroundColor='transparent';
        }
        if(EnFolks_get_object('EnFolksThreads'+this.ThreadValue)) EnFolks_get_object('EnFolksThreads'+this.ThreadValue).style.fontWeight='bold';
        if(EnFolks_get_object('EnFolksThreads'+this.ThreadValue)) EnFolks_get_object('EnFolksThreads'+this.ThreadValue).style.backgroundColor='#999999';
        if(EnFolks_get_object("EnFolksThreadsAdmin"))
            EnFolks_get_object("EnFolksThreadsAdmin").onclick=function(obj) {return function() {obj.ThreadValue=0;obj.BulletinSwitch(0, 0);};}(this);
    }
    if(EnFolks_get_object("EnFolksTypeVals")) {
        var vals=EnFolks_get_object("EnFolksTypeVals").value.split(",");
        for(var i=0;i<vals.length;i++) {
            EnFolks_get_object("EnFolksType"+vals[i]).onclick=function(obj,id) {return function() {EnFolks_get_object('EnFolksTypeSel').value=id; if(obj.type=='calendar') obj.FilterCalendar(); else if(obj.type=='jobs') obj.FilterJobs(); else obj.FilterUsers();};}(this,vals[i]);
            EnFolks_get_object("EnFolksType"+vals[i]).style.fontWeight='normal';
            EnFolks_get_object("EnFolksType"+vals[i]).style.backgroundColor='transparent';
        }
        if(EnFolks_get_object('EnFolksType0')) EnFolks_get_object('EnFolksType0').style.fontWeight='bold';
        if(EnFolks_get_object('EnFolksType0')) EnFolks_get_object('EnFolksType0').style.backgroundColor='#999999';
    }
}
EnergyFolks.prototype.BulletinSwitch = function(stream,cal_view) {
    if(this.streamFormat && stream) return;
    if(stream == 0) {
        if(cal_view)
            this.calendar_type=0;
        else
            this.calendar_type=2;
    }
    if((this.streamFormat == 0) && (stream == 0)) {
        if(cal_view)
            this.DisplayMonthly([0,0]);
        else
            this.DisplayDataList([0,10]);
    } else {
        this.data_loaded=false;
        this.ClearBuffer();
        this.InsertHTML("<BR><BR><BR><h2>Loading...</h2><BR><BR><img src='https://images.energyfolks.com/images/loader.gif'>");
        this.PrintBuffer(0);
        this.streamFormat=stream;
        if(this.streamFormat)
            this.ChooseThreadStream(this.ThreadValue);
        else {
            if(EnFolks_get_object("EnFolks_stream_filters")) EnFolks_get_object("EnFolks_stream_filters").style.display='none';
            this.terms='';
            this.LoadViews();
        }
    }
    this.TopBarHighlight();
}
EnergyFolks.prototype.LoadViews = function() {
    if(this.data_loaded) {
        if(EnFolks_get_object("EnergyFolksSubmitLoaded") && EnFolks_get_object("EnergyFolksterms")) {
            this.AttachSearchBar();
            if(this.streamFormat)
                return this.DisplayStream(0);
            else if(this.calendar_type == 0)
                this.DisplayMonthly([0,0]);
            else if(this.calendar_type == 1)
                this.DisplayWeekly(0);
            else if(this.calendar_type == 4)
                this.DisplayMap(-1);
            /*else if((this.type == "calendar") && (this.calendar_type == 2))
             this.DisplayDataList([-1,10]);
             else if(this.type == 'users')
             this.DisplayDataList([0,20]);
             else
             this.DisplayDataList([0,10]);*/
            this.PerformInitialFilter();
            this.FilterResults();
        } else
            window.setTimeout(function(obj){return function(){obj.LoadViews();};}(this),"50");
    } else {
        var curhash=window.location.hash.replace("#","");
        var todo=curhash.replace("#","").replace("ItemDetail","").replace("EnFolksDetail","");
        if(((curhash.search("ItemDetail")>-1) || (curhash.search("EnFolksDetail")>-1)) && (todo != "")) {
            this.lasthash=curhash;
            var common_obj=this.commonAncestor(EnFolks_get_object(this.div_name),EnFolks_get_object("EnergyFolksSearchBar"));
            common_obj.innerHTML="<div align=left style='text-align:left;' class='EnFolks_Direct'><div align=left style='text-align:left;max-width:800px;padding:4px;' id='EnergyFolksDetailsDivMain'></div></div><div style='display:none;'>"+common_obj.innerHTML+"</div>";
            this.loading("EnergyFolksDetailsDivMain");
            EnFolks_get_object('EnFolksTopBarDiv').style.display='none';
            this.LoadedDetail=true;
            this.AjaxRequest('https://www.energyfolks.com/'+this.type+'/detail_det/'+todo+'/'+this.affiliateid+'/1');
            return;
        }
        if(curhash.search("ThreadDet")>-1) {
            this.lasthash=curhash;
            var revid=curhash.split("_");
            if(revid.length == 2) {
                var id=revid[1]*1;
                this.ThreadValue=id;
            }
        }
        if(this.longformat && (this.type=='announce'))
            url="https://www.energyfolks.com/"+this.type+"/SearchExtBlog/"+this.affiliateid+"/"+this.ThreadValue+"/";
        else if(this.streamFormat) {
            url="https://www.energyfolks.com/"+this.type+"/Stream/"+this.affiliateid+"/"+this.RestrictValue+"/"+this.ThreadValue+"/";
        } else if(this.type == 'calendar')
            url="https://www.energyfolks.com/"+this.type+"/SearchExt/"+this.affiliateid+"/"+this.ThreadValue+"/";
        else if(this.ThreadValue > 0)
            return this.ChooseThread(this.ThreadValue);
        else
            return this.SelectThread();
        this.data_loaded=false;
        EnergyFolks_awaiting_data=true;
        this.AjaxRequest(url);
        window.setTimeout(function(obj){return function(){obj.SearchWaiter();};}(this),"50");
    }
}
EnergyFolks.prototype.parents = function(node) {
    var nodes = new Array();
    if(node == null) return nodes;
    while(1) {
        node = node.parentNode
        if(node == null) return nodes.reverse();
        nodes.push(node)
    }
    return nodes.reverse();
}
EnergyFolks.prototype.commonAncestor = function(node1, node2) {
    var parents1 = this.parents(node1)
    var parents2 = this.parents(node2)
    var retval = EnFolks_get_object(this.div_name);
    var lastgood=retval;

    for (var i = 0; i < parents1.length; i++) {
        if (parents1[i] != parents2[i])
            return lastgood;
        if((parents1[i].nodeName != "TR")
            && (parents1[i].nodeName != "TABLE")
            && (parents1[i].nodeName != "UL")
            && (parents1[i].nodeName != "LI")
            && (parents1[i].nodeName != "OL")
            && (parents1[i].nodeName != "TBODY"))
            lastgood=parents1[i];
    }
    return retval;
}
EnergyFolks.prototype.AddDataString = function(data) //Import data directly (useful for front-end loads)
{
    this.full_data=data;
    this.result_data=this.full_data;
    this.filter_data=this.full_data;
    this.data_loaded=true;
}
EnergyFolks.prototype.AddThreadString = function(data) {
    this.CountHTML=data;
}
//The following action calls should only be called after initialization and data loading
EnergyFolks.prototype.date = function(format, timestamp) {
    return EnFolks_date(format,timestamp);
}
EnergyFolks.prototype.mktime = function(i1,i2,i3,i4,i5,i6) {
    return EnFolks_mktime(i1,i2,i3,i4,i5,i6);
}
EnergyFolks.prototype.DisplayMonthly = function(inputs) //Display data in monthly form.  Inputs is an array with [Month Year] where Year is 4 digit year.  Use [0 0] for current date
{
    this.HidePopup();
    if(this.type == 'calendar')
        EnFolks_setCookie("EnFolksCal",0);
    shift_later=false;
    this.calendar_type=0;
    if((inputs[0]==0) && (inputs[1] == 0)) {
        inputs[0]=this.date("n",this.mktime())*1;
        inputs[1]=this.date("Y",this.mktime())*1;
        shift_later=true;
    }
    //Find time corresponding to start/end of current month
    var start_time=this.mktime(0,0,1,inputs[0],1,inputs[1]);
    m_end=inputs[0]+1;
    y_end=inputs[1];
    if(m_end == 13) {m_end=1;y_end++;}
    m_p=inputs[0]-1;
    y_p=inputs[1];
    if(m_p == 0) {m_p=12;y_p--;}
    var end_time=this.mktime(0,0,1,m_end,1,y_end)-2;
    //Expand to also show days in same week but different month at start, end
    start_time=start_time-3600*24*this.date("w",start_time)*1;
    end_time=end_time+3600*24*(6-this.date("w",end_time)*1);
    //If initial view and we are getting into the later part of the month, shift upwards!
    if(shift_later) {
        if(this.type == 'calendar') {
            if((this.date(EnFolksLanguage.date_j,this.mktime())*1)>15) {
                start_time+=3600*24*14+3601;
                end_time+=3600*24*14;
            } else shift_later=false;
        } else {
            if((this.date(EnFolksLanguage.date_j,this.mktime())*1)<15) {
                start_time+= -3600*24*14+3601;
                end_time+= -3600*24*14;
            } else shift_later=false;
        }
    }
    this.start_time=start_time;
    this.end_time=end_time;
    this.ClearBuffer();
    var sheight=EnFolks_getdimension(this.div_name);
    var wide=Math.floor(Math.max(60,(sheight.width-30)/7));
    if(this.type == 'calendar')
        this.BeginTable("EnFolksBackground","width:"+(20+7*wide)+"px;");
    else
        this.BeginTable("EnFolksBackground","width:"+(20+7*wide)+"px;");
    this.BeginRow("","");
    if(this.type == 'calendar') this.InsertHTML("<td style='padding:0px;margin:0px;width:20px;'></td>");
    this.BeginCell("","","text-align:left;width:100px;");
    if(shift_later && (this.type=='calendar'))
        this.InsertHTML(this.ReturnLink("javascript:;",function(obj,m,y){return function(){obj.DisplayMonthly([m,y]);};}(this,inputs[0],inputs[1]),"","","&lt;"+EnFolksLanguage.previous));
    else
        this.InsertHTML(this.ReturnLink("javascript:;",function(obj,m,y){return function(){obj.DisplayMonthly([m,y]);};}(this,m_p,y_p),"","","&lt;"+EnFolksLanguage.previous));
    this.EndCell();
    this.BeginCell("","text-align:center;' colspan='5","");
    if(shift_later) {
        if(this.type=='calendar')
            this.InsertHTML("<h3 style='margin: 2px;'>"+this.date(EnFolksLanguage.date_F,this.mktime(0,0,1,inputs[0],1,inputs[1]))+"/"+this.date(EnFolksLanguage.date_F_Y,this.mktime(0,0,1,m_end,1,y_end))+"</h3>");
        else
            this.InsertHTML("<h3 style='margin: 2px;'>"+this.date(EnFolksLanguage.date_F,this.mktime(0,0,1,m_p,1,y_p))+"/"+this.date(EnFolksLanguage.date_F_Y,this.mktime(0,0,1,inputs[0],1,inputs[1]))+"</h3>");
    } else
        this.InsertHTML("<h3 style='margin: 2px;'>"+this.date(EnFolksLanguage.date_F_Y,this.mktime(0,0,1,inputs[0],1,inputs[1]))+"</h3>");
    this.EndCell();
    this.BeginCell("","text-align:right;width:"+wide+"px;' align='right","");
    if(shift_later && (this.type!='calendar'))
        this.InsertHTML(this.ReturnLink("javascript:;",function(obj,m,y){return function(){obj.DisplayMonthly([m,y]);};}(this,inputs[0],inputs[1]),"","",EnFolksLanguage.next+"&gt;"));
    else
        this.InsertHTML(this.ReturnLink("javascript:;",function(obj,m,y){return function(){obj.DisplayMonthly([m,y]);};}(this,m_end,y_end),"","",EnFolksLanguage.next+"&gt;"));
    this.EndCell();
    this.EndRow();
    this.BeginRow("","");
    if(this.type == 'calendar') this.InsertHTML("<td style='padding:0px;margin:0px;width:20px;'></td>");
    days=[EnFolksLanguage.sunday,EnFolksLanguage.monday,EnFolksLanguage.tuesday,EnFolksLanguage.wednesday,EnFolksLanguage.thursday,EnFolksLanguage.friday,EnFolksLanguage.saturday];
    var bgstyle='background-color:#'+EnFolks_Default_Color+";";
    if(this.CustomCSS) bgstyle="";
    for(i=0;i<7;i++) {
        this.BeginCell("EnFolksHeadings EnFolksMonthDays",bgstyle+"width:"+wide+"px;","");
        this.InsertHTML(days[i]);
        this.EndCell();
    }
    this.EndRow();
    curtime=start_time;
    while(curtime < end_time) {
        this.BeginRow("","");
        if(this.type == 'calendar') {
            var weeknum=Math.floor((curtime-this.mktime())/(24*3600*7))+1;
            var bgstyle='background-color:#'+EnFolks_Default_Color+";";
            if(this.CustomCSS) bgstyle="";
            this.BeginCell("EnFolksHeadings",bgstyle+"padding:0px;margin:0px;width:20px;border-style:solid;border-width:0px 0px 1px 0px;border-color:#ffffff;vertical-align:middle;");
            this.InsertHTML(this.ReturnLink("javascript:;",function(obj,val){return function(){obj.DisplayWeekly(val);};}(this,weeknum),"","","<img class=inline src='https://images.energyfolks.com/images/calendar/weekly.png' border=0 width=20>"));
            this.EndCell();
        }
        for(i=0;i<7;i++) {
            if(this.date("m",curtime) == this.date("m",this.mktime(0,0,1,inputs[0],1,inputs[1])))
                var bgcol=" EnFolksDayBack";
            else
                var bgcol=" EnFolksDayOther";
            if(this.date("j m Y",curtime) == this.date("j m Y",this.mktime()))
                var bgcol=' EnFolksDayToday';
            lb=0;
            if(i==0) lb=1;
            this.BeginCell("EnFolksDay"+bgcol,"width:"+(wide-4)+"px;border-width:0px 1px 1px "+lb+"px;padding:2px;margin:0px;vertical-align:top;","Day"+Math.floor((curtime-start_time)/(3600*24))+"' valign='top");
            if((this.type == 'calendar') && (this.logged))
                this.InsertHTML("<div align=right style='text-align:right;cursor:pointer;' onclick=\"EnFolksMessageSize('https://www.energyfolks.com/calendar/externalpost/"+this.affiliateid+"/"+curtime+",1050,575);\" onmouseover=\"this.innerHTML='<i>add event</i> "+this.date(EnFolksLanguage.date_j,curtime)+"';\" onmouseout=\"this.innerHTML='"+this.date(EnFolksLanguage.date_j,curtime)+"';\">"+this.date(EnFolksLanguage.date_j,curtime)+"</div>");
            else
                this.InsertHTML("<div align=right style='text-align:right;'>"+this.date(EnFolksLanguage.date_j,curtime)+"</div>");
            this.EndCell();
            if(this.date("j m Y",curtime) == this.date("j m Y",curtime+3600*24))
                curtime+=3600*25;
            else
                curtime+=3600*24;
        }
        this.EndRow();
    }
    this.EndTable();
    this.PrintBuffer();
    this.FilterResults();
}
var bigmap;
EnergyFolks.prototype.ReMakeMap = function() {
    var date_parts = EnFolks_get_object("EnFolks_sdate").value.split("/");
    if(date_parts.length == 3) {
        if(EnFolksLanguage.date_m_d_y_simpE == "MM/DD/YYYY")
            selected_date = new Date(date_parts[2], date_parts[0]-1, date_parts[1]);
        if(EnFolksLanguage.date_m_d_y_simpE == "DD/MM/YYYY")
            selected_date = new Date(date_parts[2], date_parts[1]-1, date_parts[0]);
        if(EnFolksLanguage.date_m_d_y_simpE == "YYYY/MM/DD")
            selected_date = new Date(date_parts[0], date_parts[1]-1, date_parts[2]);
        if(EnFolksLanguage.date_m_d_y_simpE == "YYYY/DD/MM")
            selected_date = new Date(date_parts[0], date_parts[2]-1, date_parts[1]);
        if(EnFolksLanguage.date_m_d_y_simpE == "MM/YYYY/DD")
            selected_date = new Date(date_parts[1], date_parts[0]-1, date_parts[2]);
        if(EnFolksLanguage.date_m_d_y_simpE == "DD/YYYY/MM")
            selected_date = new Date(date_parts[1], date_parts[2]-1, date_parts[0]);
    }
    if(selected_date && !isNaN(selected_date.getYear())) { //Valid date.
        this.start_time=this.mktime(0,0,1,this.date("m",selected_date)*1,this.date("d",selected_date)*1,this.date("Y",selected_date)*1);
    }
    var date_parts = EnFolks_get_object("EnFolks_edate").value.split("/");
    if(date_parts.length == 3) {
        if(EnFolksLanguage.date_m_d_y_simpE == "MM/DD/YYYY")
            selected_date = new Date(date_parts[2], date_parts[0]-1, date_parts[1]);
        if(EnFolksLanguage.date_m_d_y_simpE == "DD/MM/YYYY")
            selected_date = new Date(date_parts[2], date_parts[1]-1, date_parts[0]);
        if(EnFolksLanguage.date_m_d_y_simpE == "YYYY/MM/DD")
            selected_date = new Date(date_parts[0], date_parts[1]-1, date_parts[2]);
        if(EnFolksLanguage.date_m_d_y_simpE == "YYYY/DD/MM")
            selected_date = new Date(date_parts[0], date_parts[2]-1, date_parts[1]);
        if(EnFolksLanguage.date_m_d_y_simpE == "MM/YYYY/DD")
            selected_date = new Date(date_parts[1], date_parts[0]-1, date_parts[2]);
        if(EnFolksLanguage.date_m_d_y_simpE == "DD/YYYY/MM")
            selected_date = new Date(date_parts[1], date_parts[2]-1, date_parts[0]);
    }
    if(selected_date && !isNaN(selected_date.getYear())) { //Valid date.
        this.end_time=this.mktime(0,0,1,this.date("m",selected_date)*1,this.date("d",selected_date)*1,this.date("Y",selected_date)*1);
    }
    this.DisplayMap(0);
}
EnergyFolks.prototype.DisplayMap = function(reset) {
    this.HidePopup();
    this.calendar_type=4;
    if(reset == -1) {
        if(this.type == 'calendar') {
            this.start_time=this.mktime();
            this.end_time=this.start_time+3600*24*14;
        } else {
            this.end_time=this.mktime();
            this.start_time=this.end_time-3600*24*31;
        }
    }
    this.ClearBuffer();
    this.InsertHTML("<div style='text-align:center;'><b>");
    this.InsertHTML("Date filter: ");
    this.InsertHTML("<input type='text' name='EnFolks_sdate' id='EnFolks_sdate' style='width:70px;'/> - <input type='text' name='EnFolks_edate' id='EnFolks_edate' style='width:70px;'/>");
    this.InsertHTML(" <button id='EnFolks_date_binder'>Update Map</button>");
    this.InsertHTML("&nbsp;&nbsp;&nbsp;&nbsp;<button id='EnFolks_date_binder2'>Re-Center and Zoom Map</button>");
    this.InsertHTML("</b></div>");
    var sheight=EnFolks_getdimension(this.div_name);
    var wide=sheight.width;
    if(!EF_Goog_loaded) {
        this.InsertHTML("<div align=center style='text-align:center;'><h2>The Google Maps library has not yet loaded.  Please wait until the library finishes loading</h2>The map will automatically appear when the library has loaded.</div>");
        this.PrintBuffer();
        window.setTimeout(function(obj) { return function() { obj.DisplayMap(-1);};}(this),1000);
        return;
    }
    this.InsertHTML("<div id='EnergyFolks_bigmap' style='width:"+wide+"px;height:500px;border:1px solid black;'></div>");
    this.PrintBuffer();
    EnFolks_get_object("EnFolks_sdate").value=this.date(EnFolksLanguage.date_m_d_y_simp,this.start_time);
    EnFolks_get_object("EnFolks_edate").value=this.date(EnFolksLanguage.date_m_d_y_simp,this.end_time);
    EnFolks_get_object("EnFolks_date_binder2").onclick=function(obj) {return function(){obj.ReZoomMap();};}(this);
    EnFolks_get_object("EnFolks_date_binder").onclick=function(obj) {return function(){obj.ReMakeMap();};}(this);
    calendar.set("EnFolks_sdate");
    calendar.set("EnFolks_edate");
    var myLatlng = new google.maps.LatLng(0,0);
    var myOptions = {
        zoom: 14,
        center: myLatlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    bigmap = new google.maps.Map(EnFolks_get_object("EnergyFolks_bigmap"), myOptions);
    this.FilterResults();
}
EnergyFolks.prototype.ReZoomMap = function() {
    var bound = new google.maps.LatLngBounds();
    var len=this.result_data.length;
    for(var i=0;i<len;i++) {
        if(this.type=='calendar') {
            if(this.result_data[i].type == 7)
                continue;
        }
        bound.extend(new google.maps.LatLng(this.result_data[i].lat,this.result_data[i].lng));
    }
    bigmap.fitBounds(bound);
}
EnergyFolks.prototype.PopulateMap = function() {
    if(this.type == 'calendar') {
        EnFolks_get_object('EnfolksShowRSVPNo').checked=true;
    }
    //function will take data from result_array and add it to the ma
    results=new Array();
    len=this.filter_data.length;
    for(i=0;i<len;i++) {
        keep=true;
        if(this.type != 'calendar') {
            this.filter_data[i].start=this.filter_data[i].time;
            //    if((this.type != "jobs") && (this.type != "announce"))
            //        this.filter_data[i].type_color=EnFolks_Default_Color;
        }
        if(this.start_time > 0) {
            if(this.filter_data[i].start < this.start_time) keep=false;
        }
        if(this.end_time > 0) {
            if(this.filter_data[i].start > this.end_time) keep=false;
        }
        if(keep)
            results.push(this.filter_data[i]);
    }
    this.result_data=results;
    len=this.result_data.length;
    var bound = new google.maps.LatLngBounds();
    for(i=0;i<len;i++) {
        if(this.type=='calendar') {
            if(this.result_data[i].type == 7)
                continue;
        }
        bound.extend(new google.maps.LatLng(this.result_data[i].lat,this.result_data[i].lng));
    }
    if(bigmap.getZoom()== 14)
        bigmap.fitBounds(bound);
    else {

        for (var j=0;j<this.markersArray.length;j++) {
            this.markersArray[j].setMap(null);
        }
        this.markersArray.length=0;
    }
    var infowindow = new google.maps.InfoWindow({
        content: EnFolksLanguage.loading+"..."
    });
    this.listener_array=new Array();
    for(var i=0;i<len;i++) {
        if(this.type == "calendar") {
            if(this.result_data[i].type == 7)
                continue;
        }
        var locale = new google.maps.LatLng(this.result_data[i].lat,this.result_data[i].lng);
        //if(this.type == 'news')
        if(this.result_data[i].highlight)
            var color=EnFolks_Default_Color;
        else
            var color='999999';
        //else
        //    var color=this.result_data[i].type_color;

        var text=this.result_data[i].name.substr(0,12);
        if(text != this.result_data[i].name) text+="...";
        var marker = new google.maps.Marker({position: locale,map:bigmap});
        marker.set('icon',new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=|"+color,null,null,new google.maps.Point(10,34)));
        marker.set('shadow',new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_shadow",null,null,new google.maps.Point(10,37)));
        //marker = new StyledMarker({styleIcon:new StyledIcon(StyledIconTypes.MARKER,{color:color}),position:locale,map:bigmap});
        this.markersArray.push(marker);
        marker.html=this.GetInlineText(i);
        marker.id2=this.listener_array.slice(0);
        marker.myid=this.result_data[i].id;
        marker.enfolks=this;
        if(this.type == 'calendar') {
            marker.curval=i;
            google.maps.event.addListener(marker, 'click', function() {
                infowindow.setContent(this.html);
                infowindow.open(bigmap,this);
                infowindow.id2=this.id2;
                infowindow.myid=this.myid;
                infowindow.enfolks=this.enfolks;
                google.maps.event.addListener(infowindow, 'domready', function () {
                    for(var i=0;i<this.id2.length;i++) {
                        EnFolks_get_object(this.id2[i].id).onclick=this.id2[i].script;
                    }
                });
            });
        } else {
            google.maps.event.addListener(marker, 'click', function() {
                infowindow.setContent(this.html);
                infowindow.open(bigmap,this);
                infowindow.id2=this.id2;
                infowindow.myid=this.myid;
                infowindow.enfolks=this.enfolks;
                google.maps.event.addListener(infowindow, 'domready', function () {
                    for(var i=0;i<this.id2.length;i++) {
                        EnFolks_get_object(this.id2[i].id).onclick=this.id2[i].script;
                    }
                });
            });
        }
        this.listener_array=new Array();
    }
}
EnergyFolks.prototype.DisplayWeekly = function(ind) {
    this.HidePopup();
    if(this.type == 'calendar')
        EnFolks_setCookie("EnFolksCal",1);
    //Creates the weekly vies, and input is a number representing offset from current week (0 is now)
    this.calendar_type=1;
    //Find time corresponding to start/end of current month
    var start_time=this.mktime(0,0,1,this.date("n",this.mktime())*1,this.date(EnFolksLanguage.date_j,this.mktime())*1,this.date("Y",this.mktime())*1);
    start_time=start_time-3600*24*this.date("w",start_time)*1+3600*24*7*ind;
    if(this.date("w",start_time) == "6") start_time+=3600;
    end_time=start_time+3600*24*7-2;
    this.start_time=start_time;
    this.end_time=end_time;
    this.ClearBuffer();
    var sheight=EnFolks_getdimension(this.div_name);
    var wide=Math.max(60,(sheight.width-80)/7);
    this.BeginTable("EnFolksBackground","width:"+(wide*7+40)+"px;");
    this.BeginRow("","");
    this.BeginCell("","text-align:left;width:"+(wide+40)+"px;padding-left:40px;' colspan='2","");
    this.InsertHTML(this.ReturnLink("javascript:;",function(obj,ind){return function(){obj.DisplayWeekly(ind-1);};}(this,ind),"","","&lt;"+EnFolksLanguage.previous));
    this.EndCell();
    this.BeginCell("","text-align:center;' colspan='5","");
    this.InsertHTML("<h3 style='margin: 2px;'>"+this.date(EnFolksLanguage.date_M_j_Y,this.start_time)+" - "+this.date(EnFolksLanguage.date_M_j_Y,this.end_time)+"</h3>");
    this.EndCell();
    this.BeginCell("","text-align:right;width:"+wide+"px;' align='right","");
    this.InsertHTML(this.ReturnLink("javascript:;",function(obj,ind){return function(){obj.DisplayWeekly(ind+1);};}(this,ind),"","",EnFolksLanguage.next+"&gt;"));
    this.EndCell();
    this.EndRow();
    this.BeginRow("","");
    this.BeginCell("","","text-align:right;width:40px;font-size:11px;");
    this.EndCell();
    var bgstyle='background-color:#'+EnFolks_Default_Color+";";
    if(this.CustomCSS) bgstyle="";
    for(i=0;i<7;i++) {
        this.BeginCell("EnFolksHeadings EnFolksMonthDays","width:"+wide+"px;"+bgstyle,"");
        this.InsertHTML(this.date(EnFolksLanguage.date_D_n_j,this.start_time+i*3600*25));
        this.EndCell();
    }
    this.EndRow();
    this.BeginRow("","");
    this.BeginCell("","","text-align:right;width:40px;font-size:11px;");
    this.InsertHTML("<div class='WeeklyDaySeperatorColor' style='width:39px;height:540px;position:relative;border-width:0px 1px 1px 0px;border-style:solid;'>");
    topl=0;
    for(i=0;i<24;i++) {
        curhour=i;
        if(EnFolksLanguage.date_g_i_a == "g:i a") {
            if(i == 0) curhour = 12;
            if(i > 12) curhour = i-12;
            if(i > 11) curhour += "&nbsp;pm"; else curhour += "&nbsp;am";
        } else curhour+=":00";
        if((i < 7) || (i > 21)) {
            this.InsertHTML("<div class='EnFolksWeeklyTimeOfDay' style='position:absolute;top:"+topl+"px;left:0px;width:34px;height:9px;padding:0px;border-bottom-width:1px;border-top-width:0px;border-left-width:0px;border-right-width:0px;text-align:right;vertical-align: top;font-size:7px;line-height:1;padding-right:5px;'>"+curhour+"</div>");
            topl+=10;
        } else {
            this.InsertHTML("<div class='EnFolksWeeklyTimeOfDay' style='position:absolute;top:"+topl+"px;left:0px;width:32px;height:25px;padding:2px;border-bottom-width:1px;border-top-width:0px;border-left-width:0px;border-right-width:0px;text-align:right;vertical-align: top;font-size:10px;line-height:1;padding-right:5px;'>"+curhour+"</div>");
            topl+=30;
        }
    }
    this.InsertHTML("</div>");
    this.EndCell();
    for(var k=0;k<7;k++) {
        this.BeginCell("","","text-align:right;width:"+wide+"px;font-size:11px;");
        var coll=' EnFolksDayBack';
        if(this.date(EnFolksLanguage.date_D_n_j_Y,this.start_time+k*3600*25) == this.date(EnFolksLanguage.date_D_n_j_Y,this.mktime()))
            coll=' EnFolksDayToday';
        this.InsertHTML("<div class='WeeklyDaySeperatorColor"+coll+"' id='Enfolks_weekly_"+k+"' style='width:"+wide+"px;height:540px;position:relative;border-width:0px 1px 1px 0px;border-style:solid;'>");
        this.InsertHTML("</div>");
        this.EndCell();
    }
    this.weekly_div="";
    topl=0;
    for(i=0;i<24;i++) {
        if((i < 7) || (i > 21)) {
            this.weekly_div+=("<div class='WeeklyHoursSeperatorColor' style='position:absolute;top:"+topl+"px;left:0px;width:"+wide+"px;height:9px;padding:0px;border-bottom-width:1px;border-top-width:0px;border-left-width:0px;border-right-width:0px;border-style:solid;'></div>");
            topl+=10;
        } else {
            this.weekly_div+=("<div class='WeeklyHoursSeperatorColor' style='position:absolute;top:"+topl+"px;left:0px;width:"+wide+"px;height:29px;padding:0px;border-bottom-width:1px;border-top-width:0px;border-left-width:0px;border-right-width:0px;border-style:solid;'></div>");
            topl+=30;
        }
    }
    this.EndRow();
    this.EndTable();
    this.PrintBuffer();
    this.FilterResults();
}
EnergyFolks.prototype.FindStartEnd = function(inn,startt,wide) {
    var j;
    var input;
    this.result_data[inn].startin=startt;
    this.result_data[inn].endin=startt+Math.floor((wide-startt)/(this.result_data[inn].tot-this.result_data[inn].level+1));
    input=this.result_data[inn].children;
    for(j=0;j<input.length;j++)
        this.FindStartEnd(input[j],this.result_data[inn].endin,wide);
}
EnergyFolks.prototype.FindChildren = function(inn,level) {
    var j;
    var out;
    var newout;
    var input;
    input=this.result_data[inn].children;
    this.result_data[inn].level=level;
    if(input.length==0) {
        this.result_data[inn].tot=level;
        return level;
    }
    out=1;
    for(j=0;j<input.length;j++) {
        newout=this.FindChildren(input[j],level+1);
        if(newout > out) out=newout;
    }
    this.result_data[inn].tot=out;
    return out;
}
EnergyFolks.prototype.PopulateWeekly = function() {
    var sheight=EnFolks_getdimension(this.div_name);
    var wide=Math.max(60,(sheight.width-80)/7);
    EnFolks_get_object('EnfolksShowRSVPNo').checked=true;
    //First clear the current view:
    curtime=this.start_time;
    for(k=0;k<7;k++) {
        EnFolks_get_object("Enfolks_weekly_"+k).innerHTML=this.weekly_div;
    }
    //function will take data from result_array and add it to the calendar view
    results=new Array();
    len=this.filter_data.length;
    for(i=0;i<len;i++) {
        keep=true;
        if(this.start_time > 0) {
            if(this.filter_data[i].end < this.start_time) keep=false;
        }
        if(this.end_time > 0) {
            if(this.filter_data[i].start > this.end_time) keep=false;
        }
        if(keep) {
            //test that the event starts/ends on same day.  If not, split!
            if(this.date("w",this.filter_data[i].start) != this.date("w",this.filter_data[i].end)) {
                var newend=EnFolks_mktime(23,59,59,this.date("n",this.filter_data[i].start)*1,this.date(EnFolksLanguage.date_j,this.filter_data[i].start)*1,this.date("Y",this.filter_data[i].start)*1);
                var newstart=EnFolks_mktime(0,0,1,this.date("n",this.filter_data[i].end)*1,this.date(EnFolksLanguage.date_j,this.filter_data[i].end)*1,this.date("Y",this.filter_data[i].end)*1);
                var op1=EnFolks_cloneit(this.filter_data[i]);
                var op2=EnFolks_cloneit(op1);
                op1.realend=this.filter_data[i].end;
                op2.realstart=this.filter_data[i].start;
                op1.end=newend;
                op2.start=newstart;
                if(this.filter_data[i].start >= this.start_time)
                    results.push(op1);
                op2.id=op1.id*-1;
                if(this.filter_data[i].end <= this.end_time)
                    results.push(op2);
            } else
                results.push(this.filter_data[i]);
        }
    }
    this.result_data=results;
    len=this.result_data.length;
    //reset overlap values
    for(i=0;i<len;i++) {
        this.result_data[i].parent=-1;
        this.result_data[i].children=new Array();
    }
    //find overlaid values
    for(i=0;i<len;i++) {
        for(k=(i+1);k<len;k++) {
            if(this.result_data[k].start < this.result_data[i].end)
            {
                cursize=this.result_data[i].end-this.result_data[i].start;
                nexsize=this.result_data[k].end-this.result_data[k].start;
                if(cursize > nexsize) {
                    if(this.result_data[k].parent == -1)
                        this.result_data[k].parent=i;
                    else {
                        j=this.result_data[k].parent;
                        cursize=this.result_data[j].end-this.result_data[j].start;
                        nexsize=this.result_data[i].end-this.result_data[i].start;
                        if(nexsize < cursize)
                            this.result_data[k].parent=i;
                    }
                } else {
                    if(this.result_data[i].parent == -1)
                        this.result_data[i].parent=k;
                    else {
                        j=this.result_data[i].parent;
                        cursize=this.result_data[j].end-this.result_data[j].start;
                        nexsize=this.result_data[k].end-this.result_data[k].start;
                        if(nexsize < cursize)
                            this.result_data[i].parent=k;
                    }
                }
            } else break;
        }
    }
    for(i=0;i<len;i++) {
        if(this.result_data[i].parent != -1)
            this.result_data[this.result_data[i].parent].children.push(i);
    }
    for(i=0;i<len;i++) {
        if(this.result_data[i].parent == -1) {
            this.FindChildren(i,1);
            this.FindStartEnd(i,0,wide);
        }
    }
    for(i=0;i<len;i++) {
        stime=this.date("G",this.result_data[i].start)*60+this.date("i",this.result_data[i].start)*1;
        etime=this.date("G",this.result_data[i].end)*60+this.date("i",this.result_data[i].end)*1;
        if(stime < (60*7))
            sloc=Math.floor(stime/60*10);
        else if(stime < (60*22))
            sloc=70+Math.floor((stime-60*7)/60*30);
        else
            sloc=70+15*30+Math.floor((stime-60*7-15*60)/60*10);
        if(etime < (60*7))
            eloc=Math.floor(etime/60*10);
        else if(etime < (60*22))
            eloc=70+Math.floor((etime-60*7)/60*30);
        else
            eloc=70+15*30+Math.floor((etime-60*7-15*60)/60*10);
        tot_wide=this.result_data[i].endin-this.result_data[i].startin-1;
        lef=this.result_data[i].startin;
        wid=Math.max(5,tot_wide-9);
        if(this.result_data[i].highlight)
            var color=EnFolks_Default_Color;
        else
            var color='999999';
        text="<div style='cursor:pointer;position:absolute;top:"+sloc+"px;left:"+lef+"px;width:"+wid+"px;height:"+Math.max(eloc-sloc-6,8)+"px;margin:0px;padding:2px;border-style:solid;border-color:#"+color+";background-color:#"+this.GetBackgroundColor(color)+ ";color:#"+this.GetForegroundColor(color)+ ";overflow:hidden;border-width:1px 1px 1px 4px;text-align:left;line-height:1;font-size:9px;' id='caldiv"+this.result_data[i].id+"' name='caldiv"+this.result_data[i].id+"'>";
        /* if(this.logged) {
         text+="<a href='javascript:;' id='calselect"+this.result_data[i].id+"' style='padding:2px 4px 0px 0px;display:inline;float:left;text-decoration:none;border-width:0px;'><img id='spinner"+this.result_data[i].id+"' style='width:12px;' src='https://images.energyfolks.com/images/icons/";
         if(this.result_data[i].selected)
         text+="minus";
         else
         text+="plus";
         if(this.enfolks)
         text+=".png' border=0 onmouseover='popup(\"<i>Add to / Remove from<BR>personal calendar</i>\");' onmouseout='hidepopup();'></a>";
         else
         text+=".png' border=0></a>";
         } */
        text+="<span id='calspan"+this.result_data[i].id+"'>";
        text+=this.result_data[i].name;
        text+="</span></div>";
        if(this.result_data[i].end < this.mktime()) {
            text+="<div style='position:absolute;top:"+(sloc+1)+"px;left:"+(lef+4)+"px;width:"+wid+"px;height:"+Math.max(eloc-sloc-6,8)+"px;margin:0px;padding:2px;border-style:solid;white-space: nowrap;border-width:0px 0px 0px 0px;text-align:left;font-size:9px;overflow:hidden;background-image:url(https://images.energyfolks.com/images/fadebox/white/40.png);' id='caldivover"+this.result_data[i].id+"' name='caldivover"+this.result_data[i].id+"'>&nbsp;</div>";
        }
        EnFolks_get_object("Enfolks_weekly_"+this.date("w",this.result_data[i].start)).innerHTML+=text;
    }
    for(var k=0;k<7;k++) {
        if(this.date(EnFolksLanguage.date_D_n_j_Y,this.start_time+k*3600*25) == this.date(EnFolksLanguage.date_D_n_j_Y,this.mktime())) {
            stime=this.date("G")*60+this.date("i")*1;
            if(stime < (60*7))
                sloc=Math.floor(stime/60*10);
            else if(stime < (60*22))
                sloc=70+Math.floor((stime-60*7)/60*30);
            else
                sloc=70+15*30+Math.floor((stime-60*7-15*60)/60*10);
            EnFolks_get_object("Enfolks_weekly_"+k).innerHTML+=("<div style='position:absolute;top:"+sloc+"px;left:0px;width:100px;height:2px;padding:0px;border-width:0px;border-color:#ffffff;border-style:none;background-color:#E64F32;'></div>");
        }
    }
    for(i=0;i<len;i++) {
        EnFolks_get_object("caldiv"+this.result_data[i].id).onmouseover=function(obj,id){return function(){obj.PopupWeeklyItem(id);};}(this,i);
        if(this.result_data[i].end < this.mktime())
            EnFolks_get_object("caldivover"+this.result_data[i].id).onmouseover=function(obj,id){return function(){obj.PopupWeeklyItem(id);};}(this,i);
        //EnFolks_get_object("caldiv"+this.result_data[i].id).onclick=function(obj,id){return function(){alert("ID:"+id + " PARENT:" + obj.result_data[id].parent+" LEVEL:"+ obj.result_data[id].level+" TOTAL:"+ obj.result_data[id].tot+" CHILDREN:"+ obj.result_data[id].children);};}(this,i);
        //if(this.logged)
        //    EnFolks_get_object("calselect"+this.result_data[i].id).onclick=function(obj,i,id,enfolks){return function(){obj.ToggleIt(i);EnFolks_get_object("spinner"+id).src="https://images.energyfolks.com/images/loader.gif";obj.AjaxRequest("https://www.energyfolks.com/calendar/ToggleEvent/"+id+"/"+enfolks);};}(this,i,this.result_data[i].id,this.enfolks);
    }
}

function EnFolks_cloneit(obj) {
    var clone = {};
    for(var i in obj) {
        if(typeof(obj[i])=="object")
            if(obj[i]==null)
                clone[i]=null;
            else
                clone[i] = EnFolks_cloneit(obj[i]);
        else {
            clone[i] = obj[i];
            if(obj[i]==null) clone[i]=null;
        }
    }
    return clone;
}
EnergyFolks.prototype.PopupWeeklyItem = function(i) {
    id=this.result_data[i].id;
    coords=this.getAnchorPosition("caldiv"+id);
    popupvar=EnFolks_get_object(this.div_name+"popup");
    if((this.date("w",this.result_data[i].start)*1) > 3)
        right=true
    else
        right=false;
    //text+=this.result_data[i].name;
    var tot_wide=this.result_data[i].endin-this.result_data[i].startin-1;
    if(right) {
        leftset=395;
        offset2=22;
        offset=393;
        align="right";
        offset4=403;
        offset5=offset-1;
        border="1px 1px 1px 0px";
    } else {
        leftset=21;
        offset2=tot_wide+26; //me
        offset=22;
        offset4=29;
        offset5=offset+tot_wide+5; //me
        border="1px 0px 1px 1px";
        align="left";
    }
    high=EnFolks_get_object("caldiv"+id).style.height;
    high=high.substr(0,high.length-2)*1+3;
    //var color=EnFolks_Default_Color;
    text="<div style='position:relative;margin:0px;padding:0px;height:16px;' id='calpopupdiv'>";
    text+="<div class='EnFolksPopup' style='position:absolute;top:22px;left:"+offset5+"px;width:0px;height:"+(high+3)+"px;border-width:0px 0px 0px 1px;border-style:solid;margin:0px;padding:0px;'></div>";
    text+="<div id='calpopupdiv2' style='position:absolute;top:0px;left:0px;width:700px;height:"+Math.max(high+60,500)+"px'></div>";
    text+="<div class='EnFolksPopup' id='calpopupdiv3' style='position:absolute;top:22px;left:"+offset2+"px;width:370px;margin:0px;padding:0px;border-width:1px;border-style:solid;text-align:left;'><table border=0 cellpadding=0 cellspacing=0 width='100%'><tr>";
    //if(right) text+="<td style='width:4px;background-color:#"+color+";'></td>";
    text+="<td style='padding:2px;text-align:left;'>";
    text+=this.GetInlineText(i)+"</td>";
    //if(!right) text+="<td style='width:4px;background-color:#"+color+";'></td>";
    text+="</tr></table></div><div class='EnFolksPopup' id='calpopupdivdet' style='width:"+tot_wide+"px;position:absolute;white-space: nowrap;overflow:hidden;top:22px;left:"+offset+"px;height:"+high+"px;margin:0px;padding:1px 2px 0px 2px;border-style:solid;border-width:"+border+";text-align:"+align+";'><i><b>";
    text+="<span id='calpopspan' style='padding:0px;margin:0px;height:"+high+"px;cursor:pointer;font-size:12px;vertical-align:top;'>"
    text+="</span></b></i></div>";
    /* if(this.logged) {
     text+="<div style='position:absolute;top:25px;left:"+offset4+"px;'>";
     text+="<a href='javascript:;' id='calselecter' style='padding:0px;display:inline;float:left;text-decoration:none;border-width:0px;'><img id='spinner2r' style='width:12px;' src='https://images.energyfolks.com/images/icons/";
     if(this.result_data[i].selected)
     text+="minus";
     else
     text+="plus";
     if(this.enfolks)
     text+=".png' border=0 onmouseover='popup(\"<i>Add to / Remove from<BR>personal calendar</i>\");' onmouseout='hidepopup();'></a>";
     else
     text+=".png' border=0></a>";
     text+="</div>";
     }
     */
    text+="</div>";
    popupvar.innerHTML=text;
    popupvar.style.top=(coords.y-22)+"px";
    popupvar.style.left=(coords.x-leftset-2)+"px";
    popupvar.style.display='block';
    if(this.logged) {
        if(this.result_data[i].selected) {
            EnFolks_get_object("calpopupdiv3").className="EnFolksPopupStarred";
            EnFolks_get_object("calpopupdivdet").className="EnFolksPopupStarred";
        }
    }
    EnFolks_get_object("calpopupdiv2").onmouseover=function(obj){return function(){obj.HidePopup();};}(this);
    //EnFolks_get_object("calpopupdiv3").onmouseover=function(obj){return function(){obj.HidePopup();};}(this);
    EnFolks_get_object("calpopspan").onclick=function(obj,id){return function(){obj.HidePopup();obj.ShowDetails(id)};}(this,id);
    for(k=0;k<this.listener_array.length;k++) {
        EnFolks_get_object(this.listener_array[k].id).onclick=this.listener_array[k].script;
    }
    this.listener_array= new Array();
    //if(this.logged && (this.type == 'calendar'))
    //    EnFolks_get_object("calselecter").onclick=function(obj,i,id,enfolks){return function(){obj.ToggleIt(i);EnFolks_get_object("spinner2r").src="https://images.energyfolks.com/images/loader.gif";EnFolks_get_object("spinner"+id).src="https://images.energyfolks.com/images/loader.gif";obj.AjaxRequest("https://www.energyfolks.com/calendar/ToggleEvent/"+id+"/"+enfolks);};}(this,i,this.result_data[i].id,this.enfolks);
}
EnergyFolks.prototype.PopulateCalendar = function() {
    var sheight=EnFolks_getdimension(this.div_name);
    var wide=Math.max(60,(sheight.width-30)/7);
    //First clear the current view:
    var curtime=this.start_time;
    while(curtime < this.end_time) {
        for(i=0;i<7;i++) {
            if((this.type == 'calendar') && (this.logged))
                EnFolks_get_object("Day"+Math.floor((curtime-this.start_time)/(3600*24))).innerHTML="<div align=right style='text-decoration:none;text-align:right;cursor:pointer;' onclick=\"EnFolksMessageSize('https://www.energyfolks.com/calendar/externalpost/"+this.affiliateid+"/"+curtime+"',1050,575);\" onmouseover=\"this.style.textDecoration='underline';this.innerHTML='add event: "+this.date(EnFolksLanguage.date_j,curtime)+"';\" onmouseout=\"this.style.textDecoration='none';this.innerHTML='"+this.date(EnFolksLanguage.date_j,curtime)+"';\">"+this.date(EnFolksLanguage.date_j,curtime)+"</div>";
            else
                EnFolks_get_object("Day"+Math.floor((curtime-this.start_time)/(3600*24))).innerHTML="<div align=right style='text-align:right;'>"+this.date(EnFolksLanguage.date_j,curtime)+"</div>";
            if(this.date("j m Y",curtime) == this.date("j m Y",curtime+3600*24))
                curtime+=3600*25;
            else
                curtime+=3600*24;
        }
    }
    //function will take data from result_array and add it to the calendar view
    var results=new Array();
    var len=this.filter_data.length;
    var rsvp=false;
    var earlybird=false;
    if(this.type == 'calendar') {
        var rsvp_box=EnFolks_get_object("EnfolksShowRSVP");
        var early_box=EnFolks_get_object("EnfolksShowRSVPearly");
    }
    for(var i=0;i<len;i++) {
        var keep=true;
        if(this.type != 'calendar') {
            this.filter_data[i].start=this.filter_data[i].time;
            //    if((this.type != "jobs") && (this.type != "announce"))
            //        this.filter_data[i].type_color=EnFolks_Default_Color;
        }
        if(this.start_time > 0) {
            if(this.filter_data[i].start < this.start_time) keep=false;
        }
        if(this.end_time > 0) {
            if(this.filter_data[i].start > this.end_time) keep=false;
        }
        if(this.type == 'calendar') {
            if(rsvp_box.checked) {
                rsvp=true;
                if(this.filter_data[i].rsvp_time == null) {
                    keep=false;
                } else {
                    keep=true;
                    if(this.start_time > 0) {
                        if(this.filter_data[i].rsvp_time < this.start_time) keep=false;
                    }
                    if(this.end_time > 0) {
                        if(this.filter_data[i].rsvp_time > this.end_time) keep=false;
                    }
                }
            }
            if(early_box.checked) {
                earlybird=true;
                if(this.filter_data[i].early_time == null) {
                    keep=false;
                } else {
                    keep=true;
                    if(this.start_time > 0) {
                        if(this.filter_data[i].early_time < this.start_time) keep=false;
                    }
                    if(this.end_time > 0) {
                        if(this.filter_data[i].early_time > this.end_time) keep=false;
                    }
                }
            }
        }
        if(keep)
            results.push(this.filter_data[i]);
    }
    this.result_data=results;

    len=this.result_data.length;
    for(i=0;i<len;i++) {
        if(this.result_data[i].highlight)
            var color=EnFolks_Default_Color;
        else
            var color='999999';
        text="<div style='position:relative;margin:1px;padding:0px;height:18px;cursor:pointer;' id='caldiv"+this.result_data[i].id+"' name='caldiv"+this.result_data[i].id+"'>"
        text+="<div style='position:absolute;top:0px;left:0px;width:"+(wide-15)+"px;height:16px;margin:0px;padding:0px 0px 0px 2px;border-style:solid;white-space: nowrap;border-color:#"+color+";background-color:#"+this.GetBackgroundColor(color)+ ";color:#"+this.GetForegroundColor(color)+ ";overflow:hidden;border-width:1px 0px 1px 4px;text-align:left;font-size:9px;'>";
        //if(this.logged && (this.type != "users")) text+="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
        text+="<span style='display:inline;white-space:nowrap;' id='calspan"+this.result_data[i].id+"'>";
        if(rsvp) text+="RSVP: ";
        if(earlybird) text+="Earlybird: ";
        text+=this.result_data[i].name;
        text+="</span></div>";
        if(this.result_data[i].end < this.mktime()) {
            text+="<div style='position:absolute;top:1px;left:4px;width:"+(wide-16)+"px;height:16px;margin:0px;padding:0px 0px 0px 2px;border-style:solid;white-space: nowrap;border-width:0px 0px 0px 0px;text-align:left;font-size:9px;overflow:hidden;background-image:url(https://images.energyfolks.com/images/fadebox/white/40.png);'>&nbsp;</div>";
        }
        text+="<div style='position:absolute;top:0px;left:6px;'>";
        /* if(this.logged && (this.type == 'calendar')) {
         text+="<a href='javascript:;' id='calselect"+this.result_data[i].id+"' style='padding:2px 4px 0px 0px;display:inline;float:left;text-decoration:none;border-width:0px;'><img id='spinner"+this.result_data[i].id+"' style='float:left;width:12px;display:inline;' src='https://images.energyfolks.com/images/icons/";
         if(this.result_data[i].selected)
         text+="minus";
         else
         text+="plus";
         if(this.enfolks)
         text+=".png' border=0 onmouseover='popup(\"<i>Add to / Remove from<BR>personal calendar</i>\");' onmouseout='hidepopup();'></a>";
         else
         text+=".png' border=0></a>";
         }
         if(this.logged && ((this.type == 'announce') || (this.type == 'jobs'))) {
         text+="<a href='javascript:;' id='calselect"+this.result_data[i].id+"' style='padding:2px 4px 0px 0px;display:inline;float:left;text-decoration:none;border-width:0px;'><img id='spinner"+this.result_data[i].id+"' style='float:left;width:12px;display:inline;' src='https://images.energyfolks.com/images/icons/";
         if(this.result_data[i].selected)
         text+="unpin";
         else
         text+="pin";
         if(this.enfolks) {
         if(this.type == "announce")
         text+=".png' border=0 onmouseover='popup(\"<i>Pin to / Unpin from<BR>personal board and<BR>subscribe to / unsubscribe from<BR>email updates</i>\");' onmouseout='hidepopup();'></a>";
         else
         text+=".png' border=0 onmouseover='popup(\"<i>Pin to / Unpin from<BR>favorites</i>\");' onmouseout='hidepopup();'></a>";
         } else
         text+=".png' border=0></a>";
         } */
        text+="</div><div style='position:absolute;top:0px;left:"+(wide-17)+"px;width:8px;height:18px;background-repeat:repeat-y;padding:0px;margin:0px;' class='";
        if(rsvp)
            curcol=EnFolks_get_object("Day"+Math.floor((this.result_data[i].rsvp_time-this.start_time)/(3600*24))).className;
        else if(earlybird)
            curcol=EnFolks_get_object("Day"+Math.floor((this.result_data[i].early_time-this.start_time)/(3600*24))).className;
        else
            curcol=EnFolks_get_object("Day"+Math.floor((this.result_data[i].start-this.start_time)/(3600*24))).className;
        if(curcol == "EnFolksDay EnFolksDayBack")
            text+='EnFolksDayBackFade';
        else if(curcol == "EnFolksDay EnFolksDayOther")
            text+='EnFolksDayOtherFade';
        else
            text+='EnFolksDayTodayFade';
        text +="'><img style='display:block;' src='https://images.energyfolks.com/images/blank.gif'></div></div>";
        if(rsvp)
            EnFolks_get_object("Day"+Math.floor((this.result_data[i].rsvp_time-this.start_time)/(3600*24))).innerHTML+=text;
        else if(earlybird)
            EnFolks_get_object("Day"+Math.floor((this.result_data[i].early_time-this.start_time)/(3600*24))).innerHTML+=text;
        else
            EnFolks_get_object("Day"+Math.floor((this.result_data[i].start-this.start_time)/(3600*24))).innerHTML+=text;
    }
    for(i=0;i<len;i++) {
        EnFolks_get_object("caldiv"+this.result_data[i].id).onmouseover=function(obj,id,rsvp,earlybird){return function(){obj.PopupCalendarItem(id,rsvp,earlybird);};}(this,i,rsvp,earlybird);
        /* if(this.logged && (this.type == 'calendar'))
         EnFolks_get_object("calselect"+this.result_data[i].id).onclick=function(obj,i,id,enfolks){return function(){obj.ToggleIt(i);EnFolks_get_object("spinner"+id).src="https://images.energyfolks.com/images/loader.gif";obj.AjaxRequest("https://www.energyfolks.com/calendar/ToggleEvent/"+id+"/"+enfolks);};}(this,i,this.result_data[i].id,this.enfolks);
         if(this.logged && (this.type == 'announce'))
         EnFolks_get_object("calselect"+this.result_data[i].id).onclick=function(obj,i,id,enfolks){return function(){obj.ToggleIt(i);EnFolks_get_object("spinner"+id).src="https://images.energyfolks.com/images/loader.gif";obj.AjaxRequest("https://www.energyfolks.com/announce/ToggleEvent/"+id+"/"+enfolks);};}(this,i,this.result_data[i].id,this.enfolks);
         if(this.logged && (this.type == 'jobs'))
         EnFolks_get_object("calselect"+this.result_data[i].id).onclick=function(obj,i,id,enfolks){return function(){obj.ToggleIt(i);EnFolks_get_object("spinner"+id).src="https://images.energyfolks.com/images/loader.gif";obj.AjaxRequest("https://www.energyfolks.com/jobs/ToggleEvent/"+id+"/"+enfolks);};}(this,i,this.result_data[i].id,this.enfolks);
         */
    }
}
EnergyFolks.prototype.checkIE7 = function() {
    // Returns the version of Internet Explorer or a -1
    // (indicating the use of another browser).

    var rv = 10; // Return value assumes failure.
    if (navigator.appName == 'Microsoft Internet Explorer')
    {
        var ua = navigator.userAgent;
        var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
        if (re.exec(ua) != null)
            rv = parseFloat( RegExp.$1 );
    }
    if(rv > 7) return true; else return false;
}
EnergyFolks.prototype.PopupCalendarItem = function(i,rsvp,earlybird) {
    var sheight=EnFolks_getdimension(this.div_name);
    var wide=Math.max(60,(sheight.width-30)/7);
    id=this.result_data[i].id;
    coords=this.getAnchorPosition("caldiv"+id);
    popupvar=EnFolks_get_object(this.div_name+"popup");
    if(rsvp) {
        if((this.date("w",this.result_data[i].rsvp_time)*1) > 3)
            right=true
        else
            right=false;
    } else if(earlybird) {
        if((this.date("w",this.result_data[i].early_time)*1) > 3)
            right=true
        else
            right=false;
    } else {
        if((this.date("w",this.result_data[i].start)*1) > 3)
            right=true
        else
            right=false;
    }
    //text+=this.result_data[i].name;
    if(right) {
        leftset=394;
        offset2=32;
        offset=403;
        align="right";
        border="1px 1px 1px 0px";
    } else {
        leftset=20;
        offset2=wide+6;
        offset=22;
        border="1px 0px 1px 1px";
        align="left";
    }
    text="<div style='position:relative;margin:0px;padding:0px;height:16px;' id='calpopupdiv'>";
    text+="<div id='calpopupdiv2' style='position:absolute;top:0px;left:0px;width:700px;height:400px'></div>";
    text+="<div id='calpopupdiv3' class='EnFolksPopup' style='position:absolute;top:22px;left:"+offset2+"px;width:370px;margin:0px;padding:0px;border-width:1px;border-style:solid;text-align:left;'><table border=0 cellpadding=0 cellspacing=0 width='100%'><tr>";
    //if(this.type == 'news')
    //    this.type='news_cal';
    //if(right) text+="<td style='width:4px;background-color:#"+this.result_data[i].type_color+";'></td>";
    text+="<td style='padding:2px;text-align:left;'>";
    text+=this.GetInlineText(i)+"</td>"; //text+=this.GetInlineText(i).replace("More information...","Click 'Details' for more information...")+"</td>";
    //if(!right) text+="<td style='width:4px;background-color:#"+this.result_data[i].type_color+";'></td>";
    //if(this.type=='news_cal')
    //    this.type='news';
    text+="</tr></table></div><div class='EnFolksPopup' id='calpopupdivdet' style='width:"+(wide-20)+"px;position:absolute;white-space: nowrap;overflow:hidden;top:22px;left:"+offset+"px;height:16px;margin:0px;padding:0px 2px 0px 2px;border-style:solid;border-width:"+border+";text-align:"+align+";'><i><b>";
    //if(this.logged && ((this.type == 'calendar') || (this.type == 'announce') || (this.type == "jobs"))) text+="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
    text+="<span id='calpopspan' style='padding:0px;margin:0px;height:16px;cursor:pointer;font-size:12px;'>"
    if(right)
        text+="&laquo; Details";
    else
        text+="Details &raquo;"
    text+="</span></b></i></div>";
    /* if(this.logged && (this.type == 'calendar')) {
     text+="<div style='position:absolute;top:23px;left:"+offset4+"px;'>";
     text+="<a href='javascript:;' id='calselecter' style='padding:0px;display:inline;float:left;text-decoration:none;border-width:0px;'><img id='spinner2r' style='width:12px;' src='https://images.energyfolks.com/images/icons/";
     if(this.result_data[i].selected)
     text+="minus";
     else
     text+="plus";
     if(this.enfolks)
     text+=".png' border=0 onmouseover='popup(\"<i>Add to / Remove from<BR>personal calendar</i>\");' onmouseout='hidepopup();'></a>";
     else
     text+=".png' border=0></a>";
     text+="</div>";
     }
     if(this.logged && ((this.type == 'announce') || (this.type == "jobs"))) {
     text+="<div style='position:absolute;top:23px;left:"+offset4+"px;'>";
     text+="<a href='javascript:;' id='calselecter' style='padding:0px;display:inline;float:left;text-decoration:none;border-width:0px;'><img id='spinner2r' style='width:12px;' src='https://images.energyfolks.com/images/icons/";
     if(this.result_data[i].selected)
     text+="unpin";
     else
     text+="pin";
     if(this.enfolks) {
     if(this.type == "announce")
     text+=".png' border=0 onmouseover='popup(\"<i>Pin to / Unpin from<BR>personal board and<BR>subscribe to / unsubscribe from<BR>email updates</i>\");' onmouseout='hidepopup();'></a>";
     else
     text+=".png' border=0 onmouseover='popup(\"<i>Pin to / Unpin from<BR>favorites</i>\");' onmouseout='hidepopup();'></a>";
     } else
     text+=".png' border=0></a>";
     text+="</div>";
     }
     */
    text+="</div>";
    popupvar.innerHTML=text;
    popupvar.style.top=(coords.y-22)+"px";
    popupvar.style.left=(coords.x-leftset-2)+"px";
    popupvar.style.display='block';
    if(this.logged && ((this.type == 'calendar') || (this.type == 'announce') || (this.type == "jobs"))) {
        if(this.result_data[i].selected) {
            EnFolks_get_object("calpopupdiv3").className="EnFolksPopupStarred";
            EnFolks_get_object("calpopupdivdet").className="EnFolksPopupStarred";
        }
    }
    EnFolks_get_object("calpopupdiv2").onmouseover=function(obj){return function(){obj.HidePopup();};}(this);
    EnFolks_get_object("calpopspan").onclick=function(obj,id){return function(){obj.HidePopup();obj.ShowDetails(id)};}(this,id);
    for(k=0;k<this.listener_array.length;k++) {
        EnFolks_get_object(this.listener_array[k].id).onclick=this.listener_array[k].script;
    }
    this.listener_array= new Array();
    /* if(this.logged && (this.type == 'calendar'))
     EnFolks_get_object("calselecter").onclick=function(obj,i,id,enfolks){return function(){obj.ToggleIt(i);EnFolks_get_object("spinner2r").src="https://images.energyfolks.com/images/loader.gif";EnFolks_get_object("spinner"+id).src="https://images.energyfolks.com/images/loader.gif";obj.AjaxRequest("https://www.energyfolks.com/calendar/ToggleEvent/"+id+"/"+enfolks);};}(this,i,this.result_data[i].id,this.enfolks);
     if(this.logged && (this.type == 'announce'))
     EnFolks_get_object("calselecter").onclick=function(obj,i,id,enfolks){return function(){obj.ToggleIt(i);EnFolks_get_object("spinner2r").src="https://images.energyfolks.com/images/loader.gif";EnFolks_get_object("spinner"+id).src="https://images.energyfolks.com/images/loader.gif";obj.AjaxRequest("https://www.energyfolks.com/announce/ToggleEvent/"+id+"/"+enfolks);};}(this,i,this.result_data[i].id,this.enfolks);
     if(this.logged && (this.type == 'jobs'))
     EnFolks_get_object("calselecter").onclick=function(obj,i,id,enfolks){return function(){obj.ToggleIt(i);EnFolks_get_object("spinner2r").src="https://images.energyfolks.com/images/loader.gif";EnFolks_get_object("spinner"+id).src="https://images.energyfolks.com/images/loader.gif";obj.AjaxRequest("https://www.energyfolks.com/jobs/ToggleEvent/"+id+"/"+enfolks);};}(this,i,this.result_data[i].id,this.enfolks);
     */
}
EnergyFolks.prototype.HidePopup = function() {
    EnFolks_get_object(this.div_name+"popup").style.display='none';
}
EnergyFolks.prototype.GetModerationQueue = function() {
    if(EnFolks_get_object("EnFolks_stream_filters"))
        EnFolks_get_object("EnFolks_stream_filters").style.display='none';
    this.streamFormat=false;
    EnFolks_get_object("EnFolksModBar").innerHTML="<h2>Moderation Queue</h2>";
    var url="https://www.energyfolks.com/"+this.type+"/moderationExt/";
    this.data_loaded=false;
    this.mod_view=true;
    EnergyFolks_awaiting_data=true;
    this.AjaxRequest(url);
    var coords=this.getAnchorPosition(this.div_name);
    var wide=EnFolks_getdimension(this.div_name);
    EnFolks_get_object(this.div_name+"loading").style.top=(coords.y+100)+'px';
    EnFolks_get_object(this.div_name+"loading").style.left=(coords.x+Math.floor((wide.width-300)/2))+'px';
    EnFolks_get_object(this.div_name+"loading").style.display='block';
    this.ThreadValue=1;
    window.setTimeout(function(obj){return function(){obj.SearchWaiter();};}(this),"50");
    return;
}
EnergyFolks.prototype.GetContentQueue = function() {
    if(EnFolks_get_object("EnFolks_stream_filters"))
        EnFolks_get_object("EnFolks_stream_filters").style.display='none';
    this.streamFormat=false;
    EnFolks_get_object("EnFolksModBar").innerHTML="<h2>Control Queue</h2>";
    var url="https://www.energyfolks.com/"+this.type+"/contentcontrolExt/";
    this.data_loaded=false;
    this.mod_view=true;
    EnergyFolks_awaiting_data=true;
    this.AjaxRequest(url);
    var coords=this.getAnchorPosition(this.div_name);
    var wide=EnFolks_getdimension(this.div_name);
    EnFolks_get_object(this.div_name+"loading").style.top=(coords.y+100)+'px';
    EnFolks_get_object(this.div_name+"loading").style.left=(coords.x+Math.floor((wide.width-300)/2))+'px';
    EnFolks_get_object(this.div_name+"loading").style.display='block';
    this.ThreadValue=1;
    window.setTimeout(function(obj){return function(){obj.SearchWaiter();};}(this),"50");
    return;
}
EnergyFolks.prototype.SearchWaiter = function() {
    if(EnergyFolks_awaiting_data || (typeof EnFolksPartners == 'undefined')) {
        window.setTimeout(function(obj){return function(){obj.SearchWaiter();};}(this),"50");
        return;
    }
    this.full_data=EnergyFolks_data_holder;  //.clone();
    EnergyFolks_data_holder=new Array(); //.clear();
    EnFolks_get_object(this.div_name+"loading").style.display='none';
    EnFolks_get_object(this.div_name).style.display='block';
    if(EnergyFolks_userid != -2)
        this.MakeLogged(EnergyFolks_userid,EnergyFolks_Fullname,EnergyFolks_SponsorName,EnergyFolks_PartnerName);
    if(EnFolks_get_object('EnFolksModLink'))
        EnFolks_get_object('EnFolksModLink').onclick=function(obj) {return function() {obj.GetModerationQueue();};}(this);
    if(EnFolks_get_object('EnFolksContentLink'))
        EnFolks_get_object('EnFolksContentLink').onclick=function(obj) {return function() {obj.GetContentQueue();};}(this);
    if(this.data_loaded)
        this.FilterResults();
    else {
        this.result_data=this.full_data;
        this.filter_data=this.full_data;
        this.data_loaded=true;
        this.LoadViews();
    }
}
EnergyFolks.prototype.FilterResults = function() {
    var cur_search=EnFolks_get_object("EnergyFolksterms").value;
    if(cur_search == EnFolksLanguage.search) cur_search="";
    if(this.longformat && (this.type=='announce'))
        var url="https://www.energyfolks.com/"+this.type+"/SearchExtBlog/"+this.affiliateid+"/"+this.ThreadValue+"/";
    else if(this.streamFormat)
        var url="https://www.energyfolks.com/"+this.type+"/Stream/"+this.affiliateid+"/"+this.RestrictValue+"/"+this.ThreadValue+"/0/";
    else
        var url="https://www.energyfolks.com/"+this.type+"/SearchExt/"+this.affiliateid+"/"+this.ThreadValue+"/";
    for(i=1;i<7;i++) {
        if(EnFolks_get_object("EnergyFolksterms"+i)) {
            if(EnFolks_get_object("EnergyFolksterms"+i).checked)
                url+="1/";
            else
                url+="0/";
        } else
            url+="0/";
    }
    url+=encodeURIComponent(cur_search);
    if(!((cur_search == "") && (this.terms == "")) && (this.terms != url)) {
        //alert(cur_search);
        this.terms=url;
        this.data_loaded=false;
        EnergyFolks_awaiting_data=true;
        this.AjaxRequest(url);
        coords=this.getAnchorPosition(this.div_name);
        EnFolks_get_object(this.div_name+"loading").style.top=(coords.y+100)+'px';
        EnFolks_get_object(this.div_name+"loading").style.left=(coords.x+350-150)+'px';
        EnFolks_get_object(this.div_name+"loading").style.display='block';
        if(this.streamFormat) {
            this.full_data=new Array();window.setTimeout(function(obj){return function(){obj.SearchWaiterStream(0);};}(this),"50");
        } else
            window.setTimeout(function(obj){return function(){obj.SearchWaiter();};}(this),"50");
        return;
    }
    if(this.type == 'calendar')
        return this.FilterCalendar();
    if(this.type == 'jobs')
        return this.FilterJobs();
    if(this.type == 'users')
        return this.FilterUsers();
    if(this.type == 'announce')
        return this.FilterAnnounce();
}
var EnergyFolks_data_holder=new Array();
var EnergyFolks_awaiting_data=false;
var EnergyFolks_Fullname="";
var EnergyFolks_SponsorName=-100;
var EnergyFolks_PartnerName=-100;
var EnergyFolks_userid=-2;
EnergyFolks.prototype.FilterCalendar = function() {
    //Function will filter results from the calendar and update the display.
    var numtype1=EnFolks_get_object('EnFolksTypeSel').value;
    if(EnFolks_get_object("EnFolksTypeVals")) {
        var vals=EnFolks_get_object("EnFolksTypeVals").value.split(",");
        for(var i=0;i<vals.length;i++) {
            EnFolks_get_object("EnFolksType"+vals[i]).style.fontWeight='normal';
            EnFolks_get_object("EnFolksType"+vals[i]).style.backgroundColor='transparent';
        }
        if(EnFolks_get_object('EnFolksType'+numtype1)) EnFolks_get_object('EnFolksType'+numtype1).style.fontWeight='bold';
        if(EnFolks_get_object('EnFolksType'+numtype1)) EnFolks_get_object('EnFolksType'+numtype1).style.backgroundColor='#999999';
    }

    var len=this.full_data.length;
    var results=new Array();
    var in3e=this.RestrictValue;
    for(var i=0;i<len;i++) {
        var includeit=false;
        if((numtype1*1) > 0) {
            if(this.full_data[i].type == (numtype1*1))
                includeit=true;
        } else includeit=true;
        var includeit3=false;
        if(in3e == 1) {
            if((""+this.full_data[i].network) == this.affiliateid) {includeit3=true;}
        } else if(in3e == 2) {
            if(this.full_data[i].highlight) {includeit3=true;}
        } else
            includeit3=true;
        if(includeit && includeit3)
            results.push(this.full_data[i]);
    }
    this.filter_data=results;
    if(this.mod_view) this.filter_data=this.full_data;
    if(this.user_view) this.filter_data=this.full_data;
    if(this.calendar_type == 2)
        this.DisplayDataList([-1,10]);
    else if(this.calendar_type == 1)
        this.PopulateWeekly();
    else if(this.calendar_type == 4)
        this.PopulateMap();
    else
        this.PopulateCalendar();
}
EnergyFolks.prototype.FilterAnnounce = function() {

    //Function will filter results from jobs and update the display.
    var len=this.full_data.length;
    var results=new Array();
    //include3
    var in3e=this.RestrictValue;
    for(var i=0;i<len;i++) {
        var includeit3=false;
        if(in3e == 1) {
            if((""+this.full_data[i].network) == this.affiliateid) {includeit3=true;}
        } else if(in3e == 2) {
            if(this.full_data[i].highlight) {includeit3=true;}
        } else
            includeit3=true;
        if(includeit3)
            results.push(this.full_data[i]);
    }
    this.filter_data=results;
    if(this.mod_view) this.filter_data=this.full_data;
    if(this.user_view) this.filter_data=this.full_data;
    if(this.calendar_type == 2)
        this.DisplayDataList([0,10]);
    else
        this.PopulateCalendar();
}
var EnFolksShowInvite=false;
EnergyFolks.prototype.FilterJobs = function() {
    //Function will filter results from the calendar and update the display.
    var numtype1=EnFolks_get_object('EnFolksTypeSel').value;
    if(EnFolks_get_object("EnFolksTypeVals")) {
        var vals=EnFolks_get_object("EnFolksTypeVals").value.split(",");
        for(var i=0;i<vals.length;i++) {
            EnFolks_get_object("EnFolksType"+vals[i]).style.fontWeight='normal';
            EnFolks_get_object("EnFolksType"+vals[i]).style.backgroundColor='transparent';
        }
        if(EnFolks_get_object('EnFolksType'+numtype1)) EnFolks_get_object('EnFolksType'+numtype1).style.fontWeight='bold';
        if(EnFolks_get_object('EnFolksType'+numtype1)) EnFolks_get_object('EnFolksType'+numtype1).style.backgroundColor='#999999';
    }
    if(this.ThreadValue < 0) return;
    var len=this.full_data.length;
    var results=new Array();
    var in3e=this.RestrictValue;
    for(var i=0;i<len;i++) {
        var includeit=false;
        if((numtype1*1) > 0) {
            if(this.full_data[i].type == (numtype1*1))
                includeit=true;
        } else includeit=true;
        var includeit3=false;
        if(in3e == 1) {
            if((""+this.full_data[i].network) == this.affiliateid) {includeit3=true;}
        } else if(in3e == 2) {
            if(this.full_data[i].highlight) {includeit3=true;}
        } else
            includeit3=true;
        if(includeit && includeit3)
            results.push(this.full_data[i]);
    }
    this.filter_data=results;
    if(this.mod_view) this.filter_data=this.full_data;
    if(this.user_view) this.filter_data=this.full_data;
    if(this.calendar_type == 2)
        this.DisplayDataList([0,10]);
    else if(this.calendar_type == 4)
        this.PopulateMap();
    else
        this.PopulateCalendar();
}
EnergyFolks.prototype.FilterUsers = function() {
    //Function will filter results from users and update the display.
    var numtype1=EnFolks_get_object('EnFolksTypeSel').value;
    if(EnFolks_get_object("EnFolksTypeVals")) {
        var vals=EnFolks_get_object("EnFolksTypeVals").value.split(",");
        for(var i=0;i<vals.length;i++) {
            EnFolks_get_object("EnFolksType"+vals[i]).style.fontWeight='normal';
            EnFolks_get_object("EnFolksType"+vals[i]).style.backgroundColor='transparent';
        }
        if(EnFolks_get_object('EnFolksType'+numtype1)) EnFolks_get_object('EnFolksType'+numtype1).style.fontWeight='bold';
        if(EnFolks_get_object('EnFolksType'+numtype1)) EnFolks_get_object('EnFolksType'+numtype1).style.backgroundColor='#999999';
    }
    if(this.ThreadValue < 0) return;
    var len=this.full_data.length;
    var alreadypopped=new Array();
    var results=new Array();
    for(var i=0;i<len;i++) {
        var includeit=false;
        if((numtype1*1) > 0) {
            if(this.full_data[i].zone == (numtype1*1))
                includeit=true;
        } else includeit=true;
        if(includeit) {
            if(!alreadypopped[this.full_data[i].id]) {
                alreadypopped[this.full_data[i].id]=true;
                results.push(this.full_data[i]);
            }
        }
    }

    this.filter_data=results;
    if(this.mod_view) this.filter_data=this.full_data;
    if(this.user_view) this.filter_data=this.full_data;
    this.DisplayDataList([0,20]);
}
EnergyFolks.prototype.CheckScroll = function(input) {
    if(this.calendar_type != 2) return;
    if(!this.inDetail) {
        if(EnFolks_get_object(this.body_div).style.display!='none') {
            var height=Math.max(document.body.scrollHeight, document.body.offsetHeight);
            var remaining = height - (window.pageYOffset + self.innerHeight);
            if(self.innerHeight == undefined)
                remaining = height - (document.documentElement.scrollTop + document.documentElement.clientHeight);
            if(document.documentElement.clientHeight == undefined)
                remaining = height - (document.body.scrollTop + document.body.clientHeight);
            // if slider past our scroll offset, then fire a request for more data
            if(remaining < 400) {
                input[2]=1;
                this.DisplayDataList(input);
                return;
            }
        }
    }
    EnFolksScrollCheck=window.setTimeout(function(obj,input) {return function() {obj.CheckScroll(input);};}(this,input),250);
}
EnergyFolks.prototype.ChooseThread = function(val) {
    if(this.streamFormat) return;
    this.ThreadValue=val;
    if(EnFolks_get_object("EnFolksThreadsVals")) {
        var vals=EnFolks_get_object("EnFolksThreadsVals").value.split(",");
        for(var i=0;i<vals.length;i++) {
            EnFolks_get_object("EnFolksThreads"+vals[i]).style.fontWeight='normal';
            EnFolks_get_object("EnFolksThreads"+vals[i]).style.backgroundColor='transparent';
        }
        if(EnFolks_get_object('EnFolksThreads'+this.ThreadValue)) EnFolks_get_object('EnFolksThreads'+this.ThreadValue).style.fontWeight='bold';
        if(EnFolks_get_object('EnFolksThreads'+this.ThreadValue)) EnFolks_get_object('EnFolksThreads'+this.ThreadValue).style.backgroundColor='#999999';
    }
    if(EnFolks_get_object('EnFolks_Select_ThreadBar'+val)) EnFolks_get_object('EnFolks_Select_ThreadBar'+val).checked=true;
    if(typeof this.CountData[val] !== 'undefined') {
        if(EnFolks_get_object("EnergyFolksloczone")) {
            this.loading("Enfolks_span4");
            var body= document.getElementsByTagName('body')[0];
            var script= document.createElement('script');
            script.type= 'text/javascript';
            script.src= "https://www.energyfolks.com/welcome/GetRegions/"+val+"/1";
            body.appendChild(script);
        }
        window.location.hash="ThreadDet_"+val;
        this.lasthash="ThreadDet_"+val;
        EnFolks_get_object('EnFolksTopBarDiv').style.display='block';
        this.full_data=this.CountData[val];
        EnFolks_get_object("EnFolksSelectThreadDiv").style.display='block';
        this.result_data=this.full_data;
        this.filter_data=this.full_data;
        this.data_loaded=true;
        this.LoadViews();
    } else {
        var coords=this.getAnchorPosition(this.div_name);
        var wide=EnFolks_getdimension(this.div_name);
        this.loading(this.div_name);
        if(this.longformat && (this.type=='announce'))
            var url="https://www.energyfolks.com/"+this.type+"/SearchExtBlog/"+this.affiliateid+"/"+val+"/";
        else
            var url="https://www.energyfolks.com/"+this.type+"/SearchExt/"+this.affiliateid+"/"+val;
        this.data_loaded=false;
        EnergyFolks_awaiting_data=true;
        this.AjaxRequest(url);
        window.setTimeout(function(obj,val){return function(){obj.ChooseThreadWaiter(val);};}(this,val),"50");
    }
}
EnergyFolks.prototype.ChooseThreadWaiter = function(val) {
    if(EnergyFolks_awaiting_data)
        return window.setTimeout(function(obj,val){return function(){obj.ChooseThreadWaiter(val);};}(this,val),"50");
    this.CountData[val]=EnergyFolks_data_holder;  //.clone();
    EnergyFolks_data_holder=new Array(); //.clear();
    if(EnergyFolks_userid != -2)
        this.MakeLogged(EnergyFolks_userid,EnergyFolks_Fullname,EnergyFolks_SponsorName,EnergyFolks_PartnerName);
    if(EnFolks_get_object('EnFolksModLink'))
        EnFolks_get_object('EnFolksModLink').onclick=function(obj) {return function() {obj.GetModerationQueue();};}(this);
    if(EnFolks_get_object('EnFolksContentLink'))
        EnFolks_get_object('EnFolksContentLink').onclick=function(obj) {return function() {obj.GetContentQueue();};}(this);
    this.ChooseThread(val);
}
EnergyFolks.prototype.SelectThread = function() {
    window.location.hash="";
    this.lasthash="";
    EnFolks_get_object('EnFolksTopBarDiv').style.display='none';
    if(EnFolks_get_object("EnFolksThreadsVals")) {
        var vals=EnFolks_get_object("EnFolksThreadsVals").value.split(",");
        for(var i=0;i<vals.length;i++) {
            EnFolks_get_object("EnFolksThreads"+vals[i]).style.fontWeight='normal';
            EnFolks_get_object("EnFolksThreads"+vals[i]).style.backgroundColor='transparent';
        }
    }
    this.ThreadValue=-1;
    if(this.CountHTML != "") {
        if(EnFolks_get_object("EnergyFolksSubmitLoaded") && EnFolks_get_object("EnergyFolksterms"))
            this.AttachSearchBar();
        EnFolks_get_object("EnFolksSelectThreadDiv").style.display='none';
        if(EnFolks_get_object("EnergyFolksterms")) {
            EnFolks_get_object("EnergyFolksterms").style.color="#bbbbbb";
            EnFolks_get_object("EnergyFolksterms").value=EnFolksLanguage.search;
        }
        this.InsertHTML("<div class='EnFolksClass'>"+this.CountHTML+"</div>");
        this.PrintBuffer();
        var allvals=EnFolks_get_object("EnFolks_Select_Thread_vals").value.split(",");

        for(var k=0;k < allvals.length;k++) {
            var i=allvals[k]*1;
            if(EnFolks_get_object("EnFolks_Select_Thread"+i))
                EnFolks_get_object("EnFolks_Select_Thread"+i).onclick=function(obj,input) {return function() {obj.ChooseThread(input);};}(this,i);
        }
    } else {
        EnFolks_get_object("EnFolksSelectThreadDiv").style.display='none';
        this.loading(this.div_name);
        var url="https://www.energyfolks.com/"+this.type+"/CountsExt/"+this.affiliateid;
        this.data_loaded=false;
        EnergyFolks_awaiting_data=true;
        this.AjaxRequest(url);
        window.setTimeout(function(obj){return function(){obj.SelectThreadWaiter();};}(this),"50");
    }
}
EnergyFolks.prototype.SelectThreadWaiter = function() {
    if((EnergyFolks_awaiting_data) || !(EnFolks_get_object("EnergyFolksSubmitLoaded") && EnFolks_get_object("EnergyFolksterms")))
        return window.setTimeout(function(obj){return function(){obj.SelectThreadWaiter();};}(this),"50");
    this.CountHTML=EnergyFolks_data_holder;  //.clone();
    EnergyFolks_data_holder=new Array(); //.clear();
    if(EnergyFolks_userid != -2)
        this.MakeLogged(EnergyFolks_userid,EnergyFolks_Fullname,EnergyFolks_SponsorName,EnergyFolks_PartnerName);
    if(EnFolks_get_object('EnFolksModLink'))
        EnFolks_get_object('EnFolksModLink').onclick=function(obj) {return function() {obj.GetModerationQueue();};}(this);
    if(EnFolks_get_object('EnFolksContentLink'))
        EnFolks_get_object('EnFolksContentLink').onclick=function(obj) {return function() {obj.GetContentQueue();};}(this);
    this.SelectThread();
}
EnergyFolks.prototype.CreateAffiliatePopup = function(pid,width,tex) {
    var ran=Math.round(Math.random()*10000000);
    var out="<div style='position:relative;margin:0px 0px 1px 0px;pading:0px;width:"+(width+2)+"px;height:"+(width+3)+"px;'>"
        + "<div style='background-color:white;position:absolute;top:0px;left:0px;padding:0px;margin:0px;border:1px solid #dfdfdf;width:"+(width)+"px;height:"+(width+2)+"px;' onmouseover='this.style.borderColor=\"#555555\";EnFolksTimer=window.setTimeout(function() { EnFolks_get_object(\"EnFolksB"+ran+"\").style.display=\"block\";EnFolks_get_object(\"EnFolks"+ran+"\").style.display=\"block\"; },150);' onmouseout='this.style.borderColor=\"#dfdfdf\";window.clearTimeout(EnFolksTimer);'>"
        + "<a href='https://www.energyfolks.com/partner/detail/"+pid+"' target='_blank'><img src='https://www.energyfolks.com/resourceimage/PartnerSmallPic"+pid+".png' style='max-width:"+width+"px;max-height:"+width+"px;margin:0px;border:0px solid black;'></a></div>"
        + "<div style='z-index:1000;position:absolute;top:-100px;left:-100px;width:600px;height:400px;display:none;' id=\"EnFolksB"+ran+"\" onmouseover='EnFolks_get_object(\"EnFolks"+ran+"\").style.display=\"none\";this.style.display=\"none\";'></div>"
        + "<div style='z-index:1001;position:absolute;top:0px;left:0px;padding:0px;margin:0px;min-height:"+(width+2)+"px;border:solid 1px black;display:none;background:transparent url(https://images.energyfolks.com/images/fadebox/back.png);' id=\"EnFolks"+ran+"\"><table cellspacing=0 cellpadding=0 border=0 style='background:transparent;padding:0px;margin:0px;'><tr><td align=left style='width:"+width+"px;height:"+width+"px;line-height:1.2;'>"
        + "<a href='https://www.energyfolks.com/partner/detail/"+pid+"' target='_blank'><img src='https://www.energyfolks.com/resourceimage/PartnerSmallPic"+pid+".png' style='max-width:"+width+"px;max-height:"+width+"px;margin:0px;border:0px solid black;'></a></td>"
        + "<td style='padding-left:5px;padding-right:5px;white-space:nowrap;vertical-align:middle;' nowrap='nowrap'>"+tex+"<a href='https://www.energyfolks.com/partner/detail/"+pid+"' target='_blank'>"+EnFolksPartners[pid]+"</a></td></tr></table></div></div>";
    return out;
}

//TODO: Build a new chatter/facebook style widget for recent posts to be displayed
EnergyFolks.prototype.DisplayStream = function(page) {
    window.location.hash="";
    this.lasthash="";
    this.ClearBuffer();
    var end=this.result_data.length;
    var startv=page*10+10;
    if(page == 0) startv=0;
    var shownv=0;
    for(var i=startv;i<end;i++) {
        shownv++;
        this.InsertHTML("<div class='EnFolksStreamItem' style='");
        if(this.result_data[i].highlight)
            this.InsertHTML("background-color:#"+EnFolks_Default_Color+";background-image:url(https://images.energyfolks.com/images/fadebox/white/75.png);");
        this.InsertHTML("'><table border=0 width='100%' style='table-layout:fixed;'><tr><td style='width:70px;padding:0px;text-align:left;' valign=top>");
        if(this.result_data[i].avatar == null)
            var intex= "<img class=inline align=left border=0 style='max-width:65px;max-height:120px;padding:3px;' src='https://www.energyfolks.com/userimages/noimage.png'>";
        else
            var intex= "<img class=inline align=left border=0 style='max-width:65px;max-height:120px;padding:3px;' src='https://www.energyfolks.com/userimages/" + this.result_data[i].avatar + ".png'>";
        this.InsertHTML(this.ReturnLink("javascript:;",function(obj,id){return function(){obj.ShowDetailsPost(id,0,'users')};}(this,this.result_data[i].userid),"text-decoration:none;","text-decoration:none;",intex))
        var popuptext="Member of";
        var wide=25;
        if(this.type == 'blog') {
            wide=40;
            popuptext="Posted from the website of";
            var all_parts=[this.result_data[i].network];
        } else if(this.result_data[i].all_partners == null)
            var all_parts=[0];
        else
            var all_parts=this.result_data[i].all_partners.split(",");
        this.InsertHTML( "</td><td style='width:"+wide+"px;padding:2px;' valign=top>");
        for(var k=0;k<all_parts.length;k++)
            this.InsertHTML(this.CreateAffiliatePopup(all_parts[k],wide,popuptext+"<BR>"));
        this.InsertHTML( "</td><td valign=top style='padding-left:8px;'>");
        var intex="<span style='font-weight:bold;color:#"+EnFolks_Default_Color+";'>" +this.result_data[i].first_name+' '+this.result_data[i].last_name+ "</span>";
        this.InsertHTML(this.ReturnLink("javascript:;",function(obj,id){return function(){obj.ShowDetailsPost(id,0,'users')};}(this,this.result_data[i].userid),"text-decoration:none;","text-decoration:none;",intex));
        this.InsertHTML( ":<i> ");
        this.InsertHTML( this.result_data[i].name + "</i>");
        if(this.result_data[i].url != "")
            this.InsertHTML("<BR><a href='http://"+this.result_data[i].url + "' target='_blank'>"+this.result_data[i].url + "</a>");
        var text="<div style='max-height:250px;overflow:hidden;margin:0px;padding:0px;' id='EnFolksLengthTesthider"+i+"'>";
        if(this.result_data[i].pic != "")
            text+= "<div align=left class='ef_mouseover' style='padding:3px;background-color:white;float:left;cursor:pointer;margin:4px;margin-right:8px;border:1px solid #cccccc;'><a href='https://www.energyfolks.com/announce/GetFile/"+this.result_data[i].id+"' target='_blank' border=0><img src='https://images.energyfolks.com/images/files/"+this.result_data[i].pic.replace("x","")+ ".png' style='width:50px;' border=0></a></div>";
        text+=this.result_data[i].html.replace(/&amp;/g,"&").replace("id='EnergyFolks_Post_Meta'","id='EnergyFolks_Post_Meta' style='visibility:hidden;'")+"<BR><span id='EnFolksLengthTest"+i+"'></span></div>";
        text+="<div style='display:none;text-decoration:italicize;color:#"+EnFolks_Default_Color+";cursor:pointer;' onclick='this.style.display=\"none\";EnFolks_get_object(\"EnFolksLengthTesthider"+i+"\").style.maxHeight=\"2500000px\";' id='EnFolksLengthTestDet"+i+"'><u>More</u></div>";
        window.setTimeout(function(i) {return function() {
            if((EnFolks_get_object("EnFolksLengthTest"+i).offsetTop+EnFolks_get_object("EnFolksLengthTest"+i).offsetHeight) > 250)
                EnFolks_get_object("EnFolksLengthTestDet"+i).style.display='block';
        };}(i),500);
        this.InsertHTML( text);

        //Score and date:
        if(this.logged) {
            var text="<input type='image' id='spinner"+this.result_data[i].id+"' style='width:17px;' src='https://images.energyfolks.com/images/icons/";
            if(this.result_data[i].selected)
                text+="unpin";
            else
                text+="pin";
            text+=".png' border=0>";
            this.InsertHTML(this.ReturnLink("javascript:;",function(obj,i,id,enfolks){return function(){obj.ToggleIt(i);EnFolks_get_object("spinner"+id).src="https://images.energyfolks.com/images/loader.gif";obj.AjaxRequest("https://www.energyfolks.com/"+obj.type+"/ToggleEvent/"+id+"/"+enfolks);};}(this,i,this.result_data[i].id,this.enfolks),"","text-decoration:none;border-width:0px;",text));
        }
        this.InsertHTML(" <span style='color:#777777;'>"+EnFolks_date(EnFolksLanguage.date_m_d_y,this.result_data[i].last_time));
        var intext="<span id='EnFolksScoreSpan" + this.result_data[i].id + "'>";
        intext+= "<a href='javascript:;' id='EnFolks_Vote_Up" + this.result_data[i].id + "'><img src='https://images.energyfolks.com/images/icons/tup.png' width=17 height=17 style='display:inline;vertical-align: -4px' border=0></a>&nbsp;";
        intext+= this.result_data[i].plus;
        intext+= "&nbsp;&nbsp;<a href='javascript:;' id='EnFolks_Vote_Down" + this.result_data[i].id + "'><img src='https://images.energyfolks.com/images/icons/tdown.png' width=17 height=17 style='display:inline;vertical-align: -4px' border=0></a>&nbsp;";
        intext+= this.result_data[i].minus;
        intext+="</span>";
        this.listener_array.push({id:'EnFolks_Vote_Up' + this.result_data[i].id,script:function(obj,i) {return function() {EnFolks_WaitingScore=true;window.setTimeout(function() {obj.UpdateScore(i);},50);EnFolks_Vote_Small_Announce(1,obj.result_data[i].id);EnFolks_get_object("EnFolksScoreSpan" + obj.result_data[i].id).innerHTML="<img width=12 class=inline src=https://images.energyfolks.com/images/loader.gif border=0> "+EnFolksLanguage.loading+"...";};}(this,i)});
        this.listener_array.push({id:'EnFolks_Vote_Down' + this.result_data[i].id,script:function(obj,i) {return function() {EnFolks_WaitingScore=true;window.setTimeout(function() {obj.UpdateScore(i);},50);EnFolks_Vote_Small_Announce(0,obj.result_data[i].id);EnFolks_get_object("EnFolksScoreSpan" + obj.result_data[i].id).innerHTML="<img width=12 class=inline src=https://images.energyfolks.com/images/loader.gif border=0> "+EnFolksLanguage.loading+"...";};}(this,i)});
        this.InsertHTML("&nbsp;&nbsp;&nbsp;&nbsp;"+intext+"</span>");
        this.InsertHTML("<div class='enfolks_share' style=''><div onclick='EnFolksShareIt(this,\"facebook\","+this.result_data[i].id+",\"https://www.energyfolks.com/"+this.type+"/detail/"+this.result_data[i].id+"\",\""+escape(this.result_data[i].name)+"\");' class=\"share facebook_share\"  share_type=\"facebook\">"+this.result_data[i].share_facebook+"</div>");
        this.InsertHTML("<div onclick='EnFolksShareIt(this,\"twitter\","+this.result_data[i].id+",\"https://www.energyfolks.com/"+this.type+"/detail"+this.result_data[i].id+"\",\""+escape(this.result_data[i].name)+"\");' class=\"share twitter_share\"  share_type=\"twitter\">"+this.result_data[i].share_twitter+"</div>");
        this.InsertHTML("<div onclick='EnFolksShareIt(this,\"linkedin\","+this.result_data[i].id+",\"https://www.energyfolks.com/"+this.type+"/detail"+this.result_data[i].id+"\",\""+escape(this.result_data[i].name)+"\");' class=\"share linkedin_share\"  share_type=\"twitter\">"+this.result_data[i].share_linkedin+"</div>");
        this.InsertHTML('<span class="google_plus"><div class="g-plusone" data-size="small" data-href="https://www.energyfolks.com/'+this.type+'/detail/'+this.result_data[i].id+'></div></span><span class="email_print">');
        this.InsertHTML("<a rel='nofollow' border=0 href='javascript:;' onclick='window.open(\"https://www.energyfolks.com/welcome/printit/Announce_detail/"+this.result_data[i].id+"/"+EnFolksAffiliateId+"\",\"printwin\");' target='_blank'><img class=\"print_image inline\" align=absmiddle> print</a>");
        this.InsertHTML("&nbsp;&nbsp;&nbsp;<a rel='nofollow' border=0 href='javascript:;' onclick='EnFolksMessageSize(\"https://www.energyfolks.com/welcome/emailittop/Announce_detail/"+this.result_data[i].id+"/"+EnFolksAffiliateId+"\",550,500);'><img class=\"email_image inline\" align=absmiddle> email</a></span></div>");
        var admin=false;
        if(this.partner_admin > 0) {
            if(this.result_data[i].partner_id == "[]") admin=false;
            else {
                var parts=eval(this.result_data[i].partner_id);
                if(parts == undefined) parts=new Array();
                for(var j=0;j<parts.length;j++) {
                    if(parts[j] == (this.partner_admin*1)) {
                        admin=true;
                        break;
                    }
                }
            }
        }
        if((this.admin) || (this.logged && ((this.userid*1) == (this.result_data[i].owner_id*1)))) admin=true;
        if(admin) {
            this.InsertHTML("<BR>Post Administration: ");
            if(this.result_data[i].verified == 0)
                this.InsertHTML("<i>Post awaiting approval</i> | ");
            if(this.result_data[i].verified == -1)
                this.InsertHTML("<i>Post rejected: update to resubmit</i> | ");
            if(this.result_data[i].owner_id != -1)
                this.InsertHTML("<a href='javascript:EnFolksMessageSize(\"https://www.energyfolks.com/"+this.type+"/edit/" + this.result_data[i].id + "/0/"+EnFolksAffiliateId+"\",1000,570);'>"+EnFolksLanguage.edit_this_post+"</a>");
            if((this.admin) || (this.logged && ((this.userid*1) == (this.result_data[i].owner_id*1))))
                this.InsertHTML(" | <a href='javascript:location.hash=\"closewindow_"  + this.result_data[i].id + "\";EnFolksMessageSize(\"https://www.energyfolks.com/"+this.type+"/Delete"+this.type.capitalize()+"/"  + this.result_data[i].id + "\",600,300);'>"+EnFolksLanguage.delete_this_post+"</a>");
            if((this.partner_admin == EnFolksAffiliateId) && (EnFolksAffiliateId > 0)) {
                if(this.result_data[i].highlight)
                    this.InsertHTML(" | <a href='javascript:EnFolksMessageSize(\"https://www.energyfolks.com/"+this.type+"/Highlight/"  + this.result_data[i].id + "\",400,300);'>Remove Highlight</a>");
                else
                    this.InsertHTML(" | <a href='javascript:EnFolksMessageSize(\"https://www.energyfolks.com/"+this.type+"/Highlight/"  + this.result_data[i].id + "\",400,300);'>Highlight</a>");
            }
        } else if((this.partner_admin == EnFolksAffiliateId) && (EnFolksAffiliateId > 0)) {
            if(this.result_data[i].highlight)
                this.InsertHTML("<BR>Post Administration: <a href='javascript:EnFolksMessageSize(\"https://www.energyfolks.com/"+this.type+"/Highlight/"  + this.result_data[i].id + "\",400,300);'>Remove Highlight</a>");
            else
                this.InsertHTML("<BR>Post Administration: <a href='javascript:EnFolksMessageSize(\"https://www.energyfolks.com/"+this.type+"/Highlight/"  + this.result_data[i].id + "\",400,300);'>Highlight</a>");
        }
        this.InsertHTML( "</td></tr></table><div style='padding-right:50px;");
        if(this.type == 'blog') this.InsertHTML("padding-left:15px;");
        this.InsertHTML("'>");

        this.InsertHTML(this.ReviewHTML(this.result_data[i].review_info,this.result_data[i].id,true));
        //$this->load->view("Announce/Reviews",array('item_id'=>$item['id'],'stream'=>true));
        this.InsertHTML( "</div></div>");
    }
    this.InsertHTML("<div id='"+this.div_name+"list"+(page+1)+"' style='margin:0px;padding:0px;'></div>");
    this.PrintBuffer(page);
    EnFolksScrollCheck=window.setTimeout(function(obj,input) {return function() {obj.CheckScrollStream(input);};}(this,page+1),250);
    EnFolks_get_object("EnFolksSelectThreadDiv").style.display='none';
    if(EnFolks_get_object("EnFolks_stream_filters"))
        EnFolks_get_object("EnFolks_stream_filters").style.display='block';
    var vals=EnFolks_get_object("EnFolksThreadsVals").value.split(",");
    for(var i=0;i<vals.length;i++) {
        EnFolks_get_object("EnFolksThreads"+vals[i]).style.fontWeight='normal';
        EnFolks_get_object("EnFolksThreads"+vals[i]).style.backgroundColor='transparent';
    }
    if(EnFolks_get_object('EnFolksThreads'+this.ThreadValue)) EnFolks_get_object('EnFolksThreads'+this.ThreadValue).style.fontWeight='bold';
    if(EnFolks_get_object('EnFolksThreads'+this.ThreadValue)) EnFolks_get_object('EnFolksThreads'+this.ThreadValue).style.backgroundColor='#999999';
    if(shownv == 0) {
        if(page == 0)
            this.InsertHTML('<div style="padding:5px;"><h2>No Results</h2>Got the conversation going by sharing your message in the box above</div>');
        this.PrintBuffer(page);return;
    }
}
EnergyFolks.prototype.ChooseThreadStream = function(input) {
    if(!this.streamFormat) { return this.ChooseThread(input); }
    this.full_data=new Array();
    this.ThreadValue=input*1;
    EnergyFolks_awaiting_data=true;
    if(EnFolks_get_object("EnFolks_stream_filters"))
        EnFolks_get_object("EnFolks_stream_filters").style.display='block';
    if(EnFolks_get_object("EnFolksThreadsVals")) {
        var vals=EnFolks_get_object("EnFolksThreadsVals").value.split(",");
        for(var i=0;i<vals.length;i++) {
            EnFolks_get_object("EnFolksThreads"+vals[i]).style.fontWeight='normal';
            EnFolks_get_object("EnFolksThreads"+vals[i]).style.backgroundColor='transparent';
        }
        if(EnFolks_get_object('EnFolksThreads'+this.ThreadValue)) EnFolks_get_object('EnFolksThreads'+this.ThreadValue).style.fontWeight='bold';
        if(EnFolks_get_object('EnFolksThreads'+this.ThreadValue)) EnFolks_get_object('EnFolksThreads'+this.ThreadValue).style.backgroundColor='#999999';
    }
    if(EnFolks_get_object('EnFolks_Select_ThreadBar'+input)) EnFolks_get_object('EnFolks_Select_ThreadBar'+input).checked=true;
    var coords=this.getAnchorPosition(this.div_name);
    EnFolks_get_object(this.div_name+"loading").style.top=(coords.y+100)+'px';
    EnFolks_get_object(this.div_name+"loading").style.left=(coords.x+350-150)+'px';
    EnFolks_get_object(this.div_name+"loading").style.display='block';
    window.setTimeout(function(obj,input){return function(){obj.SearchWaiterStream(0);};}(this,input),"50");
    var cur_search=EnFolks_get_object("EnergyFolksterms").value;
    if(cur_search == EnFolksLanguage.search) cur_search="";
    var url="https://www.energyfolks.com/"+this.type+"/Stream/"+this.affiliateid+"/"+this.RestrictValue+"/"+this.ThreadValue+"/0/";
    for(i=1;i<7;i++) {
        if(EnFolks_get_object("EnergyFolksterms"+i)) {
            if(EnFolks_get_object("EnergyFolksterms"+i).checked)
                url+="1/";
            else
                url+="0/";
        } else
            url+="0/";
    }
    url+=encodeURIComponent(cur_search);
    this.AjaxRequest(url);
}
EnergyFolks.prototype.CheckScrollStream = function(input) {
    if(!this.inDetail) {
        if(EnFolks_get_object(this.body_div).style.display!='none') {
            var height=Math.max(document.body.scrollHeight, document.body.offsetHeight);
            var remaining = height - (window.pageYOffset + self.innerHeight);
            if(self.innerHeight == undefined)
                remaining = height - (document.documentElement.scrollTop + document.documentElement.clientHeight);
            if(document.documentElement.clientHeight == undefined)
                remaining = height - (document.body.scrollTop + document.body.clientHeight);
            // if slider past our scroll offset, then fire a request for more data
            if(remaining < 400) {
                EnergyFolks_awaiting_data=true;
                EnFolks_get_object(this.div_name+"list"+input).innerHTML="<div align=center><img src='https://images.energyfolks.com/images/loader.gif'></div>";
                window.setTimeout(function(obj,input){return function(){obj.SearchWaiterStream(input);};}(this,input),"50");
                var startv=input*10+10;

                var cur_search=EnFolks_get_object("EnergyFolksterms").value;
                if(cur_search == EnFolksLanguage.search) cur_search="";
                var url="https://www.energyfolks.com/"+this.type+"/Stream/"+this.affiliateid+"/"+this.RestrictValue+"/"+this.ThreadValue+"/"+startv+"/";
                for(i=1;i<7;i++) {
                    if(EnFolks_get_object("EnergyFolksterms"+i)) {
                        if(EnFolks_get_object("EnergyFolksterms"+i).checked)
                            url+="1/";
                        else
                            url+="0/";
                    } else
                        url+="0/";
                }
                url+=encodeURIComponent(cur_search);
                this.AjaxRequest(url);
                return;
            }
        }
    }
    EnFolksScrollCheck=window.setTimeout(function(obj,input) {return function() {obj.CheckScrollStream(input);};}(this,input),250);
}

EnergyFolks.prototype.SearchWaiterStream = function(input) {
    if(EnergyFolks_awaiting_data || (typeof EnFolksPartners == 'undefined')) {
        window.setTimeout(function(obj,input){return function(){obj.SearchWaiterStream(input);};}(this,input),"50");
        return;
    }
    EnFolks_get_object(this.div_name+"loading").style.display='none';
    this.full_data=this.full_data.concat(EnergyFolks_data_holder);  //.clone();
    this.result_data=this.full_data;
    EnergyFolks_data_holder=new Array(); //.clear();
    if(EnergyFolks_userid != -2)
        this.MakeLogged(EnergyFolks_userid,EnergyFolks_Fullname,EnergyFolks_SponsorName,EnergyFolks_PartnerName);
    if(EnFolks_get_object('EnFolksModLink'))
        EnFolks_get_object('EnFolksModLink').onclick=function(obj) {return function() {obj.GetModerationQueue();};}(this);
    if(EnFolks_get_object('EnFolksContentLink'))
        EnFolks_get_object('EnFolksContentLink').onclick=function(obj) {return function() {obj.GetContentQueue();};}(this);
    this.DisplayStream(input);
}
EnergyFolks.prototype.ReviewHTML = function(data_in,id,add_last) {
    var text='';
    var tot_in=data_in.length;
    var totshown=0;
    for(var jj=0;jj<tot_in;jj++){
        var data=data_in[jj];
        var tot=data.length;
        for(var j=0;j<tot;j++) {
            data[j].flagged=data[j].flagged*1;
            data[j].replyto=data[j].replyto*1;
            data[j].lastitem=data[j].lastitem*1;
            if(data[j].flagged && (data[j].userid != this.userid) && !this.SuperAdmin) continue;
            totshown++;
        }
    }
    if(totshown > 5) {
        text+="<div id='hideextracommentslink"+id+"' style='display:block;'><table border=0 cellpadding=0 cellspacing=0 width='100%' class='ef_comment'><tr><td width=110><img src='https://images.energyfolks.com/images/blank.gif' width=110 height=1 style='width:110px;height:1px;' border=0></td><td><table border=0 width='100%' cellpadding=3 cellspacing=0 class='top_border'><tr><td style='width:2px;padding:6px;' class='content_box' valign=top></td><td style='padding:6px;' class='content_box' valign=top><a href='javascript:;' onclick='EnFolks_get_object(\"hideextracomments"+id+"\").style.display=\"block\";EnFolks_get_object(\"hideextracommentslink"+id+"\").style.display=\"none\";'>Show "+(totshown-4)+" more comments</a></td></tr></table></td></tr></table></div><div id='hideextracomments"+id+"' style='display:none;'>";
    }
    var curval=0;
    for(var jj=0;jj<tot_in;jj++){
        var data=data_in[jj];
        var tot=data.length;
        for(var j=0;j<tot;j++) {
            data[j].flagged=data[j].flagged*1;
            data[j].replyto=data[j].replyto*1;
            data[j].lastitem=data[j].lastitem*1;
            if(data[j].flagged && (data[j].userid != this.userid) && !this.SuperAdmin) continue;
            curval++;
            if(((totshown-curval) == 3) && (totshown > 5)) {
                text+="</div>";
            }
            text+= "<div id='enfolkstablerev" + data[j].id + "' class='ef_comment'>";
            if(data[j].replyto)
                text+= "<table border=0 cellpadding=0 cellspacing=0 width='100%' style='padding-bottom:6px;padding:0px;'><tr><td width=110><img src='https://images.energyfolks.com/images/blank.gif' width=110 height=1 style='width:110px;height:1px;' border=0></td><td><table border=0 width='100%' cellpadding=3 cellspacing=0 class='top_border'><tr><td style='width:45px;padding-left:80px;padding-top:6px;' class='content_box' valign=top>";
            else
                text+= "<table border=0 cellpadding=0 cellspacing=0 width='100%' style='padding-bottom:6px;padding:0px;'><tr><td width=110><img src='https://images.energyfolks.com/images/blank.gif' width=110 height=1 style='width:110px;height:1px;' border=0></td><td><table border=0 width='100%' cellpadding=3 cellspacing=0 class='top_border'><tr><td style='padding-top:6px;width:45px;' class='content_box' valign=top>";
            if(data[j].userid == this.userid) {
                data[j].first_name="You";
                data[j].last_name="wrote:";
            }
            if (data[j].avatar == null)
                var intex= "<img class=inline align=left border=0 style='max-width:40px;max-height:60px;padding:3px;' src='https://www.energyfolks.com/userimages/noimage.png'>";
            else
                var intex= "<img class=inline align=left border=0 style='max-width:40px;max-height:60px;padding:3px;' src='https://www.energyfolks.com/userimages/" + data[j].avatar + ".png'>";
            text+= this.ReturnLink("javascript:;",function(obj,id){return function(){obj.ShowDetailsPost(id,0,'users')};}(this,data[j].userid),"text-decoration:none;","text-decoration:none;",intex);
            text+= "</td>";
            text+= "<td style='padding-top:6px;width:25px;' class='content_box' valign=top>";
            if(data[j].all_partners == null) var all_parts=[0]; else var all_parts=data[j].all_partners.split(",");
            for(var k=0;k<all_parts.length;k++)
                text+=this.CreateAffiliatePopup(all_parts[k],20,"Member of<BR>");
            text+= "</td><td style='padding-top:6px;padding-left:6px;' class='content_box' valign=top>";
            var intex= "<span style='bold;color:#"+EnFolks_Default_Color+";' class='title_text'>" + data[j].first_name + " " + data[j].last_name + "</span> ";
            text+= this.ReturnLink("javascript:;",function(obj,id){return function(){obj.ShowDetailsPost(id,0,'users')};}(this,data[j].userid),"text-decoration:none;","text-decoration:none;",intex);
            var full_text=data[j].review.replace(/\n/g, '<br />');
            if(full_text.length > 250) {
                text+= "<span id='fulltext" + data[j].id + "' style='display:inline;'>"+data[j].review.substr(0,250).replace(/\n/g, '<br />')+"...<BR><a href='javascript:;' onclick='EnFolks_get_object(\"fulltext"+data[j].id+"\").style.display=\"none\";EnFolks_get_object(\"fullfulltext"+data[j].id+"\").style.display=\"inline\";'>Show full comment</a></span><span id='fullfulltext" + data[j].id + "' style='display:none;'>"+full_text+"</span>";
            } else text+= full_text;
            text+= "<div style='padding-top:5px;font-size:9px;' class='light_text'>" +EnFolks_date(EnFolksLanguage.date_m_d_y,data[j].time)+"&nbsp;&nbsp;&nbsp;&nbsp;";
            if(this.SuperAdmin && data[j].flagged) {
                text+= "Flagged</a>, ";
                text+= "<a href='javascript:;' onclick='window.open(\"https://www.energyfolks.com/"+this.type+"/ClearFlagNon/"+EnFolksAffiliateId+"/" + data[j].id + "\",\"flagwin\",\"width=500\");'>Clear Flag</a> | ";
            }
            if(this.SuperAdmin || (data[j].userid == this.userid))
                text+= "<a href='javascript:;' onclick='EnFolks_get_object(\"commentboxr" + data[j].id + "\").innerHTML=\"<iframe width=440 height=5  scrolling=\\\"no\\\" style=\\\"overflow: hidden;border:0px;\\\" src=\\\"https://www.energyfolks.com/"+this.type+"/DeleteReviewNon/\"+EnFolksAffiliateId+\"/" + data[j].id + "\\\"></iframe>\";EnFolks_get_object(\"enfolkstablerev" + data[j].id + "\").style.display=\"none\";'>Delete</a> | ";
            text+= "<span id='EnFolksScoreSpan"+data[j].id+"' style='display:inline;'>";
            if(this.logged) {
                text+= "<a href='javascript:;' onclick='EnFolks_Vote_Small_Announce_Review(1,"+data[j].id+");EnFolks_get_object(\"EnFolksScoreSpan"+data[j].id+"\").innerHTML=\"<img src=https://images.energyfolks.com/images/loader.gif class=inline border=0 width=18><i> Loading...</i>\";' border=0><img src='https://images.energyfolks.com/images/icons/tup.png' width=17 height=17 style='display:inline;vertical-align: -4px' border=0></a>&nbsp;";
                text+= data[j].plus;
                text+= "&nbsp;<a href='javascript:;' onclick='EnFolks_Vote_Small_Announce_Review(0,"+data[j].id+");EnFolks_get_object(\"EnFolksScoreSpan"+data[j].id+"\").innerHTML=\"<img src=https://images.energyfolks.com/images/loader.gif class=inline border=0 width=18><i> Loading...</i>\";' border=0><img src='https://images.energyfolks.com/images/icons/tdown.png' width=17 height=17 style='display:inline;vertical-align: -4px' border=0></a>&nbsp;";
                text+= data[j].minus;
            } else {
                //text+= data[j].score . "%&nbsp;";
                text+= "<img src='https://images.energyfolks.com/images/icons/tup.png' width=12 height=12 style='display:inline;vertical-align: -4px' border=0>&nbsp;";
                text+= data[j].plus;
                text+= "&nbsp;<img src='https://images.energyfolks.com/images/icons/tdown.png' width=12 height=12 style='display:inline;vertical-align: -4px' border=0>&nbsp;";
                text+= data[j].minus;
            }
            text+= "</span>";
            if(data[j].flagged)
                text+= " | flagged as inappropriate (awaiting moderation)";
            else {
                if((this.logged) && !((this.SuperAdmin) || (data[j].userid == this.userid)))
                    text+= " | <span id='enfolksrev" + data[j].id + "'><a href='javascript:;' onclick='EnFolks_Review_Flag2("+data[j].id+");EnFolks_get_object(\"enfolksrev" + data[j].id + "\").innerHTML=\"Site moderators have been notified.\";'>Report abuse</a></span>";
            }
            if(this.logged) {
                var idtouse=data[j].id;
                if(data[j].replyto) var idtouse=data[j].replyto;
                text+= "<span style='display:inline;' id='commenttitler" + data[j].id + "'> | <a href='javascript:;' onclick='";
                if(totshown > 5) text+="EnFolks_get_object(\"hideextracomments"+id+"\").style.display=\"block\";EnFolks_get_object(\"hideextracommentslink"+id+"\").style.display=\"none\";";
                text+= "var cur_url=window.location.href;cur_url=cur_url.replace(/#.*/, \"\").replace(/\\\\./g,\"_dot_\").replace(/\\\\/g,\"_slash_\").replace(/\\\\:/g,\"_colon_\").replace(\"?\",\"_qmark_\").replace(/&/g,\"_amp_\").replace(/=/g,\"_equals_\");EnFolks_get_object(\"commentboxrr" +idtouse+ "\").style.display=\"block\";EnFolks_get_object(\"commentboxrr" +idtouse+ "\").innerHTML=\"<iframe width=440 height=95  scrolling=\\\"no\\\" style=\\\"overflow: hidden;border:0px;\\\" src=\\\"https://www.energyfolks.com/"+this.type+"/LeaveNewReviewNonJS/\"+EnFolksAffiliateId+\"/" +id+ "/";
                text+= idtouse;
                text+= "#\"+cur_url+\"\\\" id=\\\"EnFolksReviewBox";
                text+= idtouse;
                text+= "\\\" ></iframe>\";EnFolks_get_object(\"tabcommentboxrr" +idtouse+ "\").style.display=\"block\";EnFolksCheckReview("+idtouse+");EnFolksScrollToElement(\"tabcommentboxrr" +idtouse+ "\");'>Reply</a></span>";
            }
            text+= "</div></div><div id='commentboxr" + data[j].id + "' style='display:none;text-align:left;'></div>";
            text+= "</td></tr></table>";
            text+= "</td></tr></table>";
            text+= "</div>";
            if(data[j].lastitem) {
                var idtouse=data[j].id;
                if(data[j].replyto) var idtouse=data[j].replyto;
                text+= "<div id='newcommentboxrr" +idtouse+ "' class='ef_comment'></div>";
                text+= "<div id='tabcommentboxrr" +idtouse+ "' style='display:none;' class='ef_comment'><table border=0 cellpadding=0 cellspacing=0 width='100%' style='padding:0px;'><tr><td width=110><img src='https://images.energyfolks.com/images/blank.gif' width=110 height=1 style='width:110px;height:1px;' border=0></td><td><table border=0 width='100%' cellpadding=3 cellspacing=0 class='top_border'><tr><td style='width:85px;padding:6px;' class='content_box' valign=top></td><td style='padding:5px;' class='content_box' valign=top><div id='commentboxrr" +idtouse+ "' style='display:none;text-align:left;'>";
                text+= "</div></td></tr></table></td></tr></table></div>";
            }
        }
    }
    if(add_last && this.logged) {
        text+= "<div id='newcommentboxrrm" +id+ "' class='ef_comment'></div>";
        text+= "<div id='tabcommentboxrrm" +id+ "' style='display:block;' class='ef_comment'><table border=0 cellpadding=0 cellspacing=0 width='100%' style='padding:0px;'><tr><td width=110><img src='https://images.energyfolks.com/images/blank.gif' width=110 style='width:110px;height:1px;' height=1 border=0></td><td><table border=0 width='100%' cellpadding=3 cellspacing=0 class='top_border'><tr><td style='width:2px;padding:6px;' class='content_box' valign=top></td><td style='padding:5px;' class='content_box' valign=top><div id='commentboxrrm" +id+ "' style='display:block;text-align:left;'>";
        var cur_url=window.location.href;
        cur_url=cur_url.replace(/#.*/, "").replace(/\\./g,"_dot_").replace(/\\/g,"_slash_").replace(/\\:/g,"_colon_").replace("?","_qmark_").replace(/&/g,"_amp_").replace(/=/g,"_equals_");
        text+= "<iframe width=440 height=95  scrolling=\"no\" style=\"overflow: hidden;border:0px;\" src=\"https://www.energyfolks.com/"+this.type+"/LeaveNewReviewNonJS/"+EnFolksAffiliateId+"/" +id+ "/0#"+cur_url+"\" id=\"EnFolksReviewBoxm"+id+"\" ></iframe>";
        text+= "</div></td></tr></table></td></tr></table></div>";
        EnFolksCheckReview(0);
    }
    return text;
}
EnergyFolks.prototype.DisplayDataList = function(inputs) //Function will replace div contents with output showing the events in a list format, with newer events higher.
{
    this.HidePopup();
    window.clearTimeout(EnFolksScrollCheck);
    //Inputs are 3 values:
    //inputs[0] is starting index (use -1 to find 'today')
    //inputs[1] is results_per_page
    //inputs[2] is whether to replace view or add to bottom of view
    if(this.type == 'calendar')
        EnFolks_setCookie("EnFolksCal",2);
    this.calendar_type=2;
    this.start_time=0;
    this.end_time=0;
    this.ClearBuffer();
    this.result_data=this.filter_data;

    if(this.type == 'calendar') {
        if(EnFolks_get_object("EnfolksShowRSVP").checked) {
            //REORDER AND STUFF!!
            var result=new Array();
            var len=this.filter_data.length;
            for(var i = 0;i<len;i++) {
                if(this.filter_data[i].rsvp_time != null)
                    result.push(this.filter_data[i]);
            }
            result.sort(function(a,b){return (a.rsvp_time-b.rsvp_time);});
            this.result_data=result;
        }
        if(EnFolks_get_object("EnfolksShowRSVPearly").checked) {
            //REORDER AND STUFF!!
            var result=new Array();
            var len=this.filter_data.length;
            for(var i = 0;i<len;i++) {
                if(this.filter_data[i].early_time != null)
                    result.push(this.filter_data[i]);
            }
            result.sort(function(a,b){return (a.early_time-b.early_time);});
            this.result_data=result;
        }
    }

    max_results=this.result_data.length;
    if(max_results == 0) {
        this.BeginTable("EnFolksBackground","margin:3px;");
        this.BeginRow("","");
        this.BeginCell("","","");
        if(EnFolks_get_object("EnergyFolksSubmit"))
            this.InsertHTML("<BR><h2>No Results Found</h2><p>There were no results found.  Please try loosening the search terms and filters.</p>");
        else
            this.InsertHTML("<h2>No Items Found</h2><p>There were no items found.  Please check back later to see if anything is added.</p>");
        this.EndCell();
        this.EndRow();
        this.EndTable();
    } else {
        start=inputs[0];
        per_page=inputs[1];
        if(start == -1) { //find index of 'today'
            today=this.mktime(0,0,1);
            ind=0;
            for(i=0;i<max_results;i++) {
                if(this.result_data[i].start > today) {
                    ind=i;break;
                }
            }
            start=ind; //start=per_page*Math.floor(ind/per_page);
        }
        if(start == -.9) start=-1;
        end=start+per_page;
        if(end > max_results) end=max_results;
        curpage=Math.floor(start/per_page)+1;
        if((start % 10) != 0) curpage++;
        totpage=Math.floor((max_results-1+((start+100) % 10))/per_page)+1;
        if(inputs[2] != 1) {
            var linktext=max_results + " Results";
            if(this.type == 'calendar') {
                linktext+=": Showing " + Math.max(1,start+1) + "-" + max_results;
                if((totpage > 1) && (curpage > 1)) {
                    linktext+= " (";
                    if(curpage > 3) {
                        var starval=start;
                        while(starval > 0) starval=starval-per_page;
                        linktext+=this.ReturnLink("javascript:;",function(obj,per_page,start,curpage,totpage){return function(){if(start == -1) start=-.9;obj.DisplayDataList([start,per_page]);};}(this,per_page,starval,curpage,totpage),"","","&laquo;"+EnFolksLanguage.first)+" &nbsp;";
                    }
                    if(curpage > 1) {
                        linktext+=this.ReturnLink("javascript:;",function(obj,per_page,start,curpage,totpage){return function(){var valu=start-per_page;if(valu == -1) valu=-.9;obj.DisplayDataList([(valu),per_page]);};}(this,per_page,start,curpage,totpage),"","","&lt;"+EnFolksLanguage.previous+" 10")+" ";
                    }
                    linktext+=")";
                }
            }
            this.BeginTable("EnFolksBackground","margin:0px;padding:2px 0px 0px 0px;");
            this.BeginRow("","");
            this.BeginCell("EnFolkslinkstop","padding-right:3px;","EnFolkslinkstop");
            this.InsertHTML(linktext);
            this.EndCell();
            this.EndRow();
        } else
            this.BeginTable("EnFolksBackground","margin:0px;padding:0px;");
        last_day="";
        today=this.date(EnFolksLanguage.date_l_f_j_Y,this.mktime());
        before_last=false;
        for(i=start;i<end;i++) {
            if(i < 0) continue;
            this.BeginRow("","");
            if(this.type == "calendar") {
                if(EnFolks_get_object("EnfolksShowRSVP").checked)
                    var curtime=this.result_data[i].rsvp_time;
                else if(EnFolks_get_object("EnfolksShowRSVPearly").checked)
                    var curtime=this.result_data[i].early_time;
                else
                    var curtime=this.result_data[i].start;
                cur_day=this.date(EnFolksLanguage.date_l_f_j_Y,curtime);
                if(curtime < this.mktime(0,0,1)) before_last=true;
                var drawtoday=false;
                if((curtime > this.mktime(0,0,1)) && (before_last))
                    drawtoday=true;
                if((i == start) && (curtime > this.mktime(0,0,1))) {
                    if(i == 0) drawtoday=true;
                    else {
                        if(EnFolks_get_object("EnfolksShowRSVP").checked)
                            var lastime=this.result_data[i-1].rsvp_time;
                        else if(EnFolks_get_object("EnfolksShowRSVPearly").checked)
                            var lastime=this.result_data[i-1].early_time;
                        else
                            var lastime=this.result_data[i-1].start;
                    }
                    if(lastime < this.mktime(0,0,1)) drawtoday=true;
                    if(curtime < this.mktime(23,59,59)) drawtoday=true;
                }
                if((i == start) && (i > 0) && (inputs[2] > 0)) {
                    if(EnFolks_get_object("EnfolksShowRSVP").checked)
                        var lastime=this.result_data[i-1].rsvp_time;
                    else if(EnFolks_get_object("EnfolksShowRSVPearly").checked)
                        var lastime=this.result_data[i-1].early_time;
                    else
                        var lastime=this.result_data[i-1].start;
                    last_day=this.date(EnFolksLanguage.date_l_f_j_Y,lastime);
                    if(last_day == today) {before_last=false;drawtoday=false;}
                }
                if(drawtoday) {
                    var bgstyle='background-color:#'+EnFolks_Default_Color+";";
                    if(this.CustomCSS) bgstyle="";
                    this.BeginCell("EnFolksListViewDatebar EnFolksTodayDatebar",bgstyle,"")
                    this.InsertHTML(EnFolksLanguage.today + ": "+today);
                    this.EndCell();
                    this.EndRow();
                    this.BeginRow("","");
                    last_day=today;
                    before_last=false;
                }
                if(cur_day != last_day) {
                    this.BeginCell("EnFolksListViewDatebar","","")
                    this.InsertHTML(cur_day);
                    last_day=cur_day;
                    this.EndCell();
                    this.EndRow();
                    this.BeginRow("","");
                }
            }
            this.BeginCell("","","cell"+this.result_data[i].id);
            if(this.type == "calendar") {
                if(this.result_data[i].selected)
                    this.InsertHTML("<div class='EnFolksListItemStarred' id='table"+this.result_data[i].id+"' style='display:block;'>");
                else if(this.result_data[i].highlight)
                    this.InsertHTML("<div class='EnFolksListItem' id='table"+this.result_data[i].id+"' style='display:block;background-color:#"+EnFolks_Default_Color+";background-image:url(https://images.energyfolks.com/images/fadebox/white/75.png);'>");
                else
                    this.InsertHTML("<div class='EnFolksListItem' id='table"+this.result_data[i].id+"' style='display:block;'>");
            } else if((this.type == "jobs") || (this.type=="announce")) {
                if(this.type=='announce' && this.longformat) {
                    if(this.result_data[i].selected)
                        this.InsertHTML("<div class='EnFolksListItemStarred' id='table"+this.result_data[i].id+"' style='background-image:url(https://images.energyfolks.com/images/calendar/whitelowfade.png);background-repeat:repeat-x;display:block;'>");
                    else
                        this.InsertHTML("<div class='EnFolksListItem' id='table"+this.result_data[i].id+"' style='background-color:#ffffff;background-image:url(https://images.energyfolks.com/images/calendar/whitelowfade.png);background-repeat:repeat-x;display:block;'>");
                } else {
                    if(this.result_data[i].selected)
                        this.InsertHTML("<div class='EnFolksListItemStarred' id='table"+this.result_data[i].id+"' style='display:block;'>");
                    else if(this.result_data[i].highlight)
                        this.InsertHTML("<div class='EnFolksListItem' id='table"+this.result_data[i].id+"' style='display:block;background-color:#"+EnFolks_Default_Color+";background-image:url(https://images.energyfolks.com/images/fadebox/white/75.png);'>");
                    else
                        this.InsertHTML("<div class='EnFolksListItem' id='table"+this.result_data[i].id+"' style='display:block;'>");
                }
            } else
                this.InsertHTML("<div class='EnFolksListItem' id='table"+this.result_data[i].id+"' style='display:block;'>");
            if(this.longformat)
                this.BeginTable("EnFolksBackground","padding:0px;margin:0px;min-height:60px;background-color:transparent;");
            else
                this.BeginTable("EnFolksBackground ef_mouseover","padding:0px;margin:0px;min-height:60px;");
            this.BeginRow("","");
            if((this.type != "users") && (!this.longformat) && (this.ShowNetwork)) {
                this.BeginCell("","width:44px;padding:2px;vertical-align:middle");
                this.InsertHTML(this.CreateAffiliatePopup(this.result_data[i].network,40,"Posted from website of<BR>"));
                this.EndCell();
            }
            if(this.type == "calendar") {
                this.BeginCell("","width:20px;padding:3px;vertical-align:top;' valign='top","");
                if(this.logged) {
                    text="<input type='image' id='spinner"+this.result_data[i].id+"' style='width:20px;' src='https://images.energyfolks.com/images/icons/";
                    if(this.result_data[i].selected)
                        text+="minus";
                    else
                        text+="plus";
                    if(this.enfolks)
                        text+=".png' border=0 onmouseover='popup(\"<i>Add to / Remove from<BR>personal calendar</i>\");' onmouseout='hidepopup();'>";
                    else
                        text+=".png' border=0>";
                    this.InsertHTML(this.ReturnLink("javascript:;",function(obj,i,id,enfolks){return function(){obj.ToggleIt(i);EnFolks_get_object("spinner"+id).src="https://images.energyfolks.com/images/loader.gif";obj.AjaxRequest("https://www.energyfolks.com/calendar/ToggleEvent/"+id+"/"+enfolks);};}(this,i,this.result_data[i].id,this.enfolks),"","text-decoration:none;border-width:0px;",text));
                }
                this.EndCell();
            }
            if((this.type == "jobs") || (this.type=="announce")) {
                this.BeginCell("","width:20px;padding:3px;vertical-align:top;' valign='top","");
                if(this.logged) {
                    text="<input type='image' id='spinner"+this.result_data[i].id+"' style='width:20px;' src='https://images.energyfolks.com/images/icons/";
                    if(this.result_data[i].selected)
                        text+="unpin";
                    else
                        text+="pin";
                    if(this.enfolks) {
                        if(this.type == "announce")
                            text+=".png' border=0 onmouseover='popup(\"<i>subscribe to / unsubscribe from<BR>email updates</i>\");' onmouseout='hidepopup();'>";
                        else
                            text+=".png' border=0 onmouseover='popup(\"<i>Add to / remove from<BR>favorites</i>\");' onmouseout='hidepopup();'>";
                    } else
                        text+=".png' border=0>";
                    this.InsertHTML(this.ReturnLink("javascript:;",function(obj,i,id,enfolks){return function(){obj.ToggleIt(i);EnFolks_get_object("spinner"+id).src="https://images.energyfolks.com/images/loader.gif";obj.AjaxRequest("https://www.energyfolks.com/"+obj.type+"/ToggleEvent/"+id+"/"+enfolks);};}(this,i,this.result_data[i].id,this.enfolks),"","text-decoration:none;border-width:0px;",text));
                }
                this.EndCell();
            }
            if(this.longformat)
                this.BeginCell("","","TableTD"+this.result_data[i].id);
            else
                this.BeginCell("","cursor:pointer;","TableTD"+this.result_data[i].id);
            if(!this.longformat)
                this.listener_array.push({id:'TableTD' + this.result_data[i].id,script:function(obj,i) {return function() {obj.ShowDetails(i);};}(this,this.result_data[i].id)});
            this.InsertHTML(this.GetInlineText(i,true));
            this.EndCell();
            if(this.SuperAdmin && (this.type == 'users')) {
                this.BeginCell("EnFolksadminbox","width:100px;");
                if(this.result_data[i].user || this.result_data[i].calendar || this.result_data[i].jobs || this.result_data[i].announce || this.result_data[i].zone_admin)
                    this.InsertHTML( "<li>Site Admin</li>");
                if(this.result_data[i].sponsor)
                    this.InsertHTML( "<li>Sponsor Admin</li>");
                if(this.result_data[i].partner)
                    this.InsertHTML( "<li>Partner Admin</li>");
                this.InsertHTML( "<a href='javascript:EnFolksMessageSize(\"https://www.energyfolks.com/admin/user_rights/" + this.result_data[i].id + "\",550,450);'>Change User Rights</a><BR>");
                if(this.result_data[i].verified == -1)
                    this.InsertHTML( "<a href='javascript:EnFolksMessageSize(\"https://www.energyfolks.com/admin/verifyuser/" + this.result_data[i].id + "\",400,300);'>Unblock this user</a>");
                else if(this.result_data[i].verified == 1)
                    this.InsertHTML( "<a href='javascript:EnFolksMessageSize(\"https://www.energyfolks.com/admin/blockuser/" + this.result_data[i].id + "\",400,300);'>Disable this user</a>");
                else
                    this.InsertHTML( "<a href='javascript:EnFolksMessageSize(\"https://www.energyfolks.com/admin/verifyuser/" + this.result_data[i].id + "\",400,300);'>Manually verify this user</a>");
                if(EnFolksShowInvite)
                    this.InsertHTML( "<BR><a href='javascript:EnFolksMessageSize(\"https://www.energyfolks.com/partner/inviteremove/" + this.result_data[i].id + "\"),400,300;'>Invite/Remove from your group</a>");
                this.EndCell();
            } else if((this.admin || ((this.partner_admin == EnFolksAffiliateId) && (EnFolksAffiliateId > 0))) && (this.type == 'users')) {
                this.BeginCell("EnFolksadminbox","width:100px;");
                if(this.mod_view) {
                    this.InsertHTML("<h4>Moderation</h4>");
                    this.InsertHTML("<a href='javascript:location.hash=\"closewindow_"  + this.result_data[i].id + "\";EnFolksMessageSize(\"https://www.energyfolks.com/"+this.type+"/approve/"  + this.result_data[i].id + "\",600,300);'>Approve</a><BR>");
                    this.InsertHTML("<a href='javascript:EnFolksMessageSize(\"https://www.energyfolks.com/"+this.type+"/RejectJS/"  + this.result_data[i].id + "\",600,300);'>Reject</a>");
                } else {
                    if(this.result_data[i].partner)
                        this.InsertHTML( "<li>Partner Admin</li>");
                    this.InsertHTML( "<a href='javascript:EnFolksMessageSize(\"https://www.energyfolks.com/partner/user_rights/" + this.result_data[i].id + "\",450,350);'>Group Admin Settings</a><BR>");
                    if(EnFolksShowInvite)
                        this.InsertHTML( "<a href='javascript:EnFolksMessageSize(\"https://www.energyfolks.com/partner/inviteremove/" + this.result_data[i].id + "\",400,300);'>Invite/Remove from your group</a><BR>");
                    if(this.result_data[i].resume)
                        this.InsertHTML("<a href='http://dev.energyfolks.com/users/GetResume/"+this.result_data[i].id+"' target='_blank'>View Resume</a>");
                }
                this.EndCell();
            }else if(this.type != 'users') {
                if((this.type == "announce") && (!this.longformat)) {
                    this.BeginCell("","width:150px;text-align:right;vertical-align:middle;padding-right:3px;");
                    if(this.result_data[i].owner_id < 1)
                        var intext='';
                    else
                        var intext="<a onclick='event.cancelBubble = true;if(event.stopPropagation) event.stopPropagation();return true;' href='https://www.energyfolks.com/users/profile/"+this.result_data[i].user_id+"' border=0>";
                    if (this.result_data[i].avatar == null)
                        intext+="<img align=right height=45 border=0 style='height:45px;padding:1px 5px 1px 5px;display:inline;text-decoration:none;vertical-align:middle;' src='https://www.energyfolks.com/userimages/noimage.png'>";
                    else
                        intext+="<img align=right height=45 border=0 style='height:45px;padding:1px 5px 1px 5px;display:inline;text-decoration:none;' src='https://www.energyfolks.com/userimages/"+this.result_data[i].avatar+".png'>";
                    if(this.result_data[i].owner_id < 1) {
                        intext+="energyfolks administrator";
                    } else {
                        intext+="</a><a onclick='event.cancelBubble = true;if(event.stopPropagation) event.stopPropagation();return true;' href='https://www.energyfolks.com/users/profile/"+this.result_data[i].user_id+"' border=0>";
                        intext+=this.result_data[i].first_name + " " + this.result_data[i].last_name+"</a>";
                    }
                    intext+= '<BR><span style="color:#666666;">'+ EnFolks_date(EnFolksLanguage.date_m_d_y,this.result_data[i].time)+'</span>';
                    this.InsertHTML(intext);
                    this.EndCell();
                } else if(this.type == "calendar") {
                    this.BeginCell("","width:150px;text-align:right;vertical-align:middle;padding-right:3px;");
                    var intext= "<span id='EnFolksScoreSpan" + this.result_data[i].id + "'>";
                    intext+= "<a href='javascript:;' id='EnFolks_Vote_Up" + this.result_data[i].id + "'><img src='https://images.energyfolks.com/images/icons/tup.png' width=17 height=17 style='display:inline;vertical-align: -4px' border=0></a>&nbsp;";
                    intext+= this.result_data[i].plus;
                    intext+= "&nbsp;&nbsp;<a href='javascript:;' id='EnFolks_Vote_Down" + this.result_data[i].id + "'><img src='https://images.energyfolks.com/images/icons/tdown.png' width=17 height=17 style='display:inline;vertical-align: -4px' border=0></a>&nbsp;";
                    intext+= this.result_data[i].minus;
                    intext+="</span><BR>";
                    intext+=this.ReturnLink("javascript:;",function(obj,id){return function(){obj.ShowDetails(id);};}(this,this.result_data[i].id),"","",this.result_data[i].attending + EnFolksLanguage.attending) + " | ";
                    if(this.result_data[i].totcomment == 1)
                        intext+=this.ReturnLink("javascript:;",function(obj,id){return function(){obj.ShowDetails(id);};}(this,this.result_data[i].id),"","",this.result_data[i].totcomment + EnFolksLanguage.review);
                    else
                        intext+=this.ReturnLink("javascript:;",function(obj,id){return function(){obj.ShowDetails(id);};}(this,this.result_data[i].id),"","",this.result_data[i].totcomment + EnFolksLanguage.reviews);
                    this.InsertHTML(intext);
                    this.listener_array.push({id:'EnFolks_Vote_Up' + this.result_data[i].id,script:function(obj,i) {return function() {EnFolks_WaitingScore=true;window.setTimeout(function() {obj.UpdateScore(i);},50);EnFolks_Vote_Small(1,obj.result_data[i].id,obj.result_data[i].end);EnFolks_get_object("EnFolksScoreSpan" + obj.result_data[i].id).innerHTML="<img width=12 class=inline src=https://images.energyfolks.com/images/loader.gif border=0> "+EnFolksLanguage.loading+"...";};}(this,i)});
                    this.listener_array.push({id:'EnFolks_Vote_Down' + this.result_data[i].id,script:function(obj,i) {return function() {EnFolks_WaitingScore=true;window.setTimeout(function() {obj.UpdateScore(i);},50);EnFolks_Vote_Small(0,obj.result_data[i].id,obj.result_data[i].end);EnFolks_get_object("EnFolksScoreSpan" + obj.result_data[i].id).innerHTML="<img width=12 class=inline src=https://images.energyfolks.com/images/loader.gif border=0> "+EnFolksLanguage.loading+"...";};}(this,i)});
                    this.EndCell();
                }
                var admin=false;
                if(this.partner_admin > 0) {
                    if(this.result_data[i].partner_id == "[]") admin=false;
                    else {
                        var parts=eval(this.result_data[i].partner_id);
                        if(parts == undefined) parts=new Array();
                        for(var j=0;j<parts.length;j++) {
                            if(parts[j] == (this.partner_admin*1)) {
                                admin=true;
                                break;
                            }
                        }
                    }
                }
                if((this.admin) || (this.logged && ((this.userid*1) == (this.result_data[i].owner_id*1)))) admin=true;
                if(this.type == "calendar") {
                    if(this.result_data[i].sponsor_id == this.sponsor_admin) admin=true;
                }
                if(admin) {
                    this.BeginCell("EnFolksadminbox","width:100px;");
                    if(this.mod_view) {
                        this.InsertHTML("<h4>Moderation</h4>");
                        this.InsertHTML("<a href='javascript:location.hash=\"closewindow_"  + this.result_data[i].id + "\";EnFolksMessageSize(\"https://www.energyfolks.com/"+this.type+"/approve/"  + this.result_data[i].id + "\",600,300);'>"+EnFolksLanguage.approve_this_post+"</a><BR>");
                        this.InsertHTML("<a href='javascript:EnFolksMessageSize(\"https://www.energyfolks.com/"+this.type+"/RejectJS/"  + this.result_data[i].id + "\",600,300);'>"+EnFolksLanguage.reject_this_post+"</a><BR>");
                    } else {
                        if(this.result_data[i].verified == 0)
                            this.InsertHTML("<h4>Post awaiting approval</h4>");
                        if(this.result_data[i].verified == -1)
                            this.InsertHTML("<h4>Post rejected: update to resubmit</h4>");
                    }
                    if(this.result_data[i].owner_id != -1)
                        this.InsertHTML("<a href='javascript:EnFolksMessageSize(\"https://www.energyfolks.com/"+this.type+"/edit/" + this.result_data[i].id + "/0/"+EnFolksAffiliateId+"\",1000,570);'>"+EnFolksLanguage.edit_this_post+"</a><BR>");
                    if((this.admin) || (this.logged && ((this.userid*1) == (this.result_data[i].owner_id*1))))
                        this.InsertHTML("<a href='javascript:location.hash=\"closewindow_"  + this.result_data[i].id + "\";EnFolksMessageSize(\"https://www.energyfolks.com/"+this.type+"/Delete"+this.type.capitalize()+"/"  + this.result_data[i].id + "\",600,300);'>"+EnFolksLanguage.delete_this_post+"</a>");
                    if((this.partner_admin == EnFolksAffiliateId) && (EnFolksAffiliateId > 0)) {
                        if(this.result_data[i].highlight)
                            this.InsertHTML("<BR><a href='javascript:EnFolksMessageSize(\"https://www.energyfolks.com/"+this.type+"/Highlight/"  + this.result_data[i].id + "\",400,300);'>Remove Highglight</a>");
                        else
                            this.InsertHTML("<BR><a href='javascript:EnFolksMessageSize(\"https://www.energyfolks.com/"+this.type+"/Highlight/"  + this.result_data[i].id + "\",400,300);'>Highlight</a>");
                    }
                    this.EndCell();
                } else if((this.partner_admin == EnFolksAffiliateId) && (EnFolksAffiliateId > 0)) {
                    this.BeginCell("EnFolksadminbox","width:100px;");
                    if(this.mod_view) {
                        this.InsertHTML("<a href='javascript:location.hash=\"closewindow_"  + this.result_data[i].id + "\";EnFolksMessageSize(\"https://www.energyfolks.com/"+this.type+"/approve/"  + this.result_data[i].id + "\",600,300);'>"+EnFolksLanguage.approve_this_post+"</a><BR>");
                        this.InsertHTML("<a href='javascript:location.hash=\"closewindow_"  + this.result_data[i].id + "\";EnFolksMessageSize(\"https://www.energyfolks.com/"+this.type+"/reject2/"  + this.result_data[i].id + "\",600,300);'>"+EnFolksLanguage.reject_this_post+"</a><BR>");
                    }
                    if(this.result_data[i].highlight)
                        this.InsertHTML("<a href='javascript:EnFolksMessageSize(\"https://www.energyfolks.com/"+this.type+"/Highlight/"  + this.result_data[i].id + "\",400,300);'>Remove Highlight</a>");
                    else
                        this.InsertHTML("<a href='javascript:EnFolksMessageSize(\"https://www.energyfolks.com/"+this.type+"/Highlight/"  + this.result_data[i].id + "\",400,300);'>Highlight</a>");
                    this.EndCell();
                }
            }
            this.EndRow();
            this.EndTable();
            this.InsertHTML("<div class='EnFolksSepLine'></div></div>");
            this.EndCell();
            this.EndRow();
        }
        this.EndTable();
        this.InsertHTML("<div id='"+this.div_name+"list"+(start+per_page)+"' style='margin:0px;padding:0px;'></div>")
        if((totpage-curpage) > 0)
            EnFolksScrollCheck=window.setTimeout(function(obj,input) {return function() {obj.CheckScroll(input);};}(this,[(start+per_page),per_page]),250);
    }
    if(inputs[2] > 0)
        this.PrintBuffer(start); else this.PrintBuffer(0);
}
EnFolksScrollCheck=window.setTimeout(function() { },25000);
EnergyFolks.prototype.MakeAdmin = function() {
    this.admin=true; //This adds administration links etc, but note that these links wont work unless you are actually an admin, even if you change this code to make them appear...
}
EnergyFolks.prototype.MakeLogged = function(id,name,sponsor,partner) {
    this.logged=true; //This adds administration links etc for logged in users, but note that these links wont work unless you are actually an admin, even if you change this code to make them appear...
    this.userid=id;
    this.full_name=name;
    this.partner_admin=partner;
    this.sponsor_admin=sponsor;
    /*if(EnFolks_get_object("EnergyFolksLoginDiv")) {
     if(this.affiliateid != "0")
     EnFolks_get_object("EnergyFolksLoginDiv").innerHTML="<span id='EnFolks_Loggedinas'>"+EnFolksLanguage.logged_in_as+"</span> <a target='_blank' href='https://www.energyfolks.com/accounts/ExtProfile/"+this.affiliateid+"' style='text-decoration:none;color:#" + EnFolks_Default_Color + ";' onmouseout='this.style.textDecoration=\"none\";' onmouseover='this.style.textDecoration=\"underline\";'>"+this.full_name+"</a>";
     else
     EnFolks_get_object("EnergyFolksLoginDiv").innerHTML="<span id='EnFolks_Loggedinas'>"+EnFolksLanguage.logged_in_as+"</span> <a target='_blank' href='https://www.energyfolks.com/accounts/Profile' style='text-decoration:none;color:#" + EnFolks_Default_Color + ";' onmouseout='this.style.textDecoration=\"none\";' onmouseover='this.style.textDecoration=\"underline\";'>"+this.full_name+"</a>";
     EnFolks_get_object("EnergyFolksLoginDiv").style.display="block";
     }*/
}
var WindowY=0;
EnergyFolks.prototype.ShowDetails = function(id,i) {
    this.ShowDetailsPost(id,i,this.type);
}
EnergyFolks.prototype.ShowDetailsPost = function(id,i,type) {
    this.lasthash="ItemDetail"+id;
    window.location.hash="ItemDetail"+id;
    //EnFolks_get_object('EnFolks_detmessagebar').style.backgroundColor='#'+EnFolks_Default_Color;
    //EnFolks_get_object('EnFolks_detmessagebar').style.height='2px';
    if((this.calendar_type == 0 ) || (this.calendar_type == 1))
        this.HidePopup();

    WindowY=EnFolksScrollTop();
    this.lastScrollTop=WindowY;
    EnFolks_get_object(this.detail_div).style.display='block';
    var valueT = 0, valueL = 0;
    var element=EnFolks_get_object(this.body_div);
    do {
        valueT += element.offsetTop  || 0;
        valueL += element.offsetLeft || 0;
        element = element.offsetParent;
    } while (element);
    EnFolks_get_object(this.detail_div).style.left=valueL+'px';
    EnFolks_get_object(this.detail_div).style.top=(Math.max(WindowY,valueT)+50)+'px';
    this.inDetail=true;

    //EnFolks_get_object(this.body_div).style.display='none';
    EnFolks_get_object("EnergyFolksDetailsDiv").innerHTML='<div id="'+this.detail_div+'high" style="width:1px;height:800px;">&nbsp;</div>';
    var y = (document.height !== undefined) ? document.height : document.body.offsetHeight;
    var x = (document.width !== undefined) ? document.width : document.body.offsetWidth;
    var sheight=EnFolks_getdimension(this.body_div);
    //EnFolks_get_object('EnFolks_greyout2').style.width=x + 'px';
    //EnFolks_get_object('EnFolks_greyout2').style.height=y + 'px';
    offset=[0,0];
    //EnFolks_get_object('EnFolks_greyout2').style.top=offset[1] + 'px';
    //EnFolks_get_object('EnFolks_greyout2').style.left=offset[0] + 'px';
    EnFolks_get_object('EnFolks_greyout2').style.display='block';
    var steps=20;
    var wide=sheight.width-50;
    var curt=new Date();
    this.lastY=curt.getTime();
    this.Animate(EnFolks_get_object(this.detail_div).style,'width',10,wide,steps,300,function(obj,id,type) {return function(){EnFolks_get_object(obj.detail_div+"high").style.width="auto";obj.loading(obj.detail_div+"high");obj.AjaxRequest('https://www.energyfolks.com/'+type+'/detail_det/'+id+'/'+obj.affiliateid);};}(this,id,type));
}
EnergyFolks.prototype.BackToResults = function() {
    WindowY=EnFolksScrollTop();
    var sheight=EnFolks_getdimension(this.detail_div);
    EnFolks_get_object("EnergyFolksDetailsDiv").innerHTML='<div id="'+this.detail_div+'high" style="width:1px;height:'+sheight.height+'px;">&nbsp;</div>';
    EnFolks_get_object('EnFolks_greyout2').style.display='none';
    if((this.type == "announce") || (this.type == 'jobs')) {
        this.lasthash="ThreadDet_"+this.ThreadValue;
        window.location.hash="ThreadDet_"+this.ThreadValue;
    } else {
        this.lasthash="";
        window.location.hash="";
    }
    this.inDetail=false;
    var steps=20;
    var curt=new Date();
    this.lastY=curt.getTime();
    this.Animate(EnFolks_get_object(this.detail_div).style,'width',sheight.width,10,steps,300,function(obj) {return function() {EnFolks_get_object(obj.detail_div).style.display='none';};}(this));
    //EnFolks_get_object(this.body_div).style.display='block';
    window.scrollTo(0,WindowY);
    EnFolksSmoothScroll(this.lastScrollTop);
}
EnergyFolks.prototype.Animate = function(element,attr,from,to,steps,time,callback) {
    var curt=new Date();
    var tim=curt.getTime()-this.lastY;
    var step=Math.floor((to-from)/steps);
    var ntime=Math.floor(time/steps);
    if(attr == 'width')
        element.width=(from+step)+'px';
    else if(attr == 'height')
        element.height=(from+step)+'px';
    this.lastY=curt.getTime();
    if(steps == 1) {
        callback();
    } else
        window.setTimeout(function(obj,element,attr,from,to,steps,time,callback) {return function(){obj.Animate(element,attr,from,to,steps,time,callback)};}(this,element,attr,from+step,to,Math.max(1,steps-Math.round(tim/ntime)),time-tim,callback),ntime);
}
var SmoothScrollVar;
var LastWindowY=-100;
function EnFolksSmoothScroll(to) {
    if (SmoothScrollVar)
        window.clearTimeout(SmoothScrollVar);
    WindowY=EnFolksScrollTop();
    if(WindowY == LastWindowY) return;
    LastWindowY=WindowY;
    var pixper=Math.max(Math.floor(Math.abs(WindowY-to)/3),10);
    var secper=30;
    if(EnFolksBrowser.IE) {
        pixper=pixper*3;
        secper=secper*3;
    }
    if(Math.abs(WindowY-to) > pixper) {
        if(WindowY > to)
            WindowY-=pixper;
        else
            WindowY+=pixper;
    } else
        WindowY=to;
    window.scrollTo(0,WindowY);
    if(WindowY != to)
        SmoothScrollVar=window.setTimeout(function(to){return function() {EnFolksSmoothScroll(to);};}(to),secper);
    else
        LastWindowY=-100;
}
function EnFolksScrollTop() {
    return EnFolks_filterResults (
        window.pageYOffset ? window.pageYOffset : 0,
        document.documentElement ? document.documentElement.scrollTop : 0,
        document.body ? document.body.scrollTop : 0
    );
}
function EnFolks_filterResults(n_win, n_docel, n_body) {
    var n_result = n_win ? n_win : 0;
    if (n_docel && (!n_result || (n_result > n_docel)))
        n_result = n_docel;
    return n_body && (!n_result || (n_result > n_body)) ? n_body : n_result;
}
//PRIVATE METHODS: METHODS BELOW ARE NOT INTENDED TO BE CALLED DIRECTLY
EnergyFolks.prototype.AjaxRequest = function(url) {
    var head= document.getElementsByTagName('head')[0];
    var script= document.createElement('script');
    script.type= 'text/javascript';
    script.src= url;
    head.appendChild(script);
}
function EnFolks_ToggleCal(id) {
    EnFolks_get_object("EnFolks_ToggleCal1").src='https://images.energyfolks.com/images/loader.gif';
    EnFolks_get_object("EnFolks_ToggleCal2").innerHTML=EnFolksLanguage.loading+'...';
    if(EnFolks_get_object("spinner"+id)) {
        EnFolks_get_object("spinner"+id).click();
    } else {
        var head= document.getElementsByTagName('body')[0];
        var script= document.createElement('script');
        script.type= 'text/javascript';
        script.src= "https://www.energyfolks.com/calendar/ToggleEventDetail/"+id+"/";
        head.appendChild(script);
    }
}
function EnFolks_ToggleAnnounce(id) {
    EnFolks_get_object("EnFolks_ToggleCal1").src='https://images.energyfolks.com/images/loader.gif';
    EnFolks_get_object("EnFolks_ToggleCal2").innerHTML=EnFolksLanguage.loading+'...';
    if(EnFolks_get_object("spinner"+id)) {
        EnFolks_get_object("spinner"+id).click();
    } else {
        var head= document.getElementsByTagName('body')[0];
        var script= document.createElement('script');
        script.type= 'text/javascript';
        script.src= "https://www.energyfolks.com/announce/ToggleEventDetail/"+id+"/";
        head.appendChild(script);
    }
}
function EnFolks_ToggleJobs(id) {
    EnFolks_get_object("EnFolks_ToggleCal1").src='https://images.energyfolks.com/images/loader.gif';
    EnFolks_get_object("EnFolks_ToggleCal2").innerHTML=EnFolksLanguage.loading+'...';
    if(EnFolks_get_object("spinner"+id)) {
        EnFolks_get_object("spinner"+id).click();
    } else {
        var head= document.getElementsByTagName('body')[0];
        var script= document.createElement('script');
        script.type= 'text/javascript';
        script.src= "https://www.energyfolks.com/jobs/ToggleEventDetail/"+id+"/";
        head.appendChild(script);
    }
}
function EnFolks_Vote_Announce(val,id) {
    var head= document.getElementsByTagName('body')[0];
    var script= document.createElement('script');
    script.type= 'text/javascript';
    script.src= "https://www.energyfolks.com/announce/Vote/"+val+"/"+id;
    head.appendChild(script);
}
function EnFolks_Vote_Small_Announce(val,id) {
    var head= document.getElementsByTagName('body')[0];
    var script= document.createElement('script');
    script.type= 'text/javascript';
    script.src= "https://www.energyfolks.com/announce/VoteSmall/"+val+"/"+id;
    head.appendChild(script);
}
function EnFolks_Vote_Small_Announce_Review(val,id) {
    var head= document.getElementsByTagName('body')[0];
    var script= document.createElement('script');
    script.type= 'text/javascript';
    script.src= "https://www.energyfolks.com/announce/VoteSmallReview/"+val+"/"+id;
    head.appendChild(script);
}
function EnFolks_Vote(val,id,end) {
    var head= document.getElementsByTagName('body')[0];
    var script= document.createElement('script');
    script.type= 'text/javascript';
    script.src= "https://www.energyfolks.com/calendar/Vote/"+val+"/"+id;
    head.appendChild(script);
    if(val == -1) return;
    if(end > EnFolks_mktime()) return;
    EnFolksMessageSize("https://www.energyfolks.com/calendar/ReviewNon/"+id+"/"+EnFolksAffiliateId,500,550);
}
function EnFolks_Review_Flag(id) {
    var head= document.getElementsByTagName('body')[0];
    var script= document.createElement('script');
    script.type= 'text/javascript';
    script.src= "https://www.energyfolks.com/calendar/Flag/"+id;
    head.appendChild(script);
}
function EnFolks_Review_Flag2(id) {
    var head= document.getElementsByTagName('body')[0];
    var script= document.createElement('script');
    script.type= 'text/javascript';
    script.src= "https://www.energyfolks.com/announce/Flag/"+id;
    head.appendChild(script);
}
function EnFolks_Vote_Small(val,id,end) {
    var head= document.getElementsByTagName('body')[0];
    var script= document.createElement('script');
    script.type= 'text/javascript';
    script.src= "https://www.energyfolks.com/calendar/VoteSmall/"+val+"/"+id;
    head.appendChild(script);
    if(val == -1) return;
    if(end > EnFolks_mktime()) return;
    EnFolksMessageSize("https://www.energyfolks.com/calendar/ReviewNon/"+id+"/"+EnFolksAffiliateId,500,550);
}
function EnFolks_Choose_Zone(url,id) {
    EnFolks_get_object("EnfolksResultDiv").innerHTML="<div align=center><img src='https://images.energyfolks.com/images/loader.gif'><h2>"+EnFolksLanguage.loading+"...</h2></div>";
    var head= document.getElementsByTagName('head')[0];
    var script= document.createElement('script');
    script.type= 'text/javascript';
    script.src= url;
    head.appendChild(script);
    if(EnFolks_get_object("EnergyFolksloczone")) {
        var head= document.getElementsByTagName('head')[0];
        var script= document.createElement('script');
        script.type= 'text/javascript';
        script.src= "https://www.energyfolks.com/welcome/GetRegions/"+id;
        head.appendChild(script);
    }
}
function EnFolks_Choose_Lang(lang) {
    if(EnFolks_get_object("EnfolksResultDiv"))
        EnFolks_get_object("EnfolksResultDiv").innerHTML="<div align=center><img src='https://images.energyfolks.com/images/loader.gif'><h2>"+EnFolksLanguage.loading+"...</h2></div>";
    var head= document.getElementsByTagName('head')[0];
    var script= document.createElement('script');
    script.type= 'text/javascript';
    script.src= "https://www.energyfolks.com/welcome/ChooseLang2/"+lang;
    head.appendChild(script);
}
EnergyFolks.prototype.ToggleIt = function(i) {
    if(this.result_data[i].selected)
        this.result_data[i].selected=false;
    else
        this.result_data[i].selected=true;
    len=this.full_data.length;
    for(k=0;k<len;k++) {
        if(this.full_data[k].id == this.result_data[i].id) {
            this.full_data[k].selected=this.result_data[i].selected;
            return;
        }
    }
}
EnergyFolks.prototype.GetForegroundColor = function(sHex) {
    //eliminate the pound sign
    if (sHex.charAt(0) == "#") {
        sHex = sHex.substring(1);
    } //ENd: if (sHex.charAt(0) == "#")
    //extract and convert the red, green, and blue values
    var iRed = parseInt(sHex.substring(0,2),16);
    var iGreen = parseInt(sHex.substring(2,4),16);
    var iBlue = parseInt(sHex.substring(4,6),16);
    var iMax = Math.max(iRed,iGreen,iBlue);
    var iMin = Math.min(iRed,iGreen,iBlue);
    var iLum = Math.round((iMax+iMin)/2);
    if(iLum > 128)
        return "282828";
    else
        return "ffffff";

}
EnergyFolks.prototype.GetBackgroundColor = function(sHex) {
    //eliminate the pound sign
    if (sHex.charAt(0) == "#") {
        sHex = sHex.substring(1);
    } //ENd: if (sHex.charAt(0) == "#")
    //extract and convert the red, green, and blue values
    var iRed = parseInt(sHex.substring(0,2),16);
    var iGreen = parseInt(sHex.substring(2,4),16);
    var iBlue = parseInt(sHex.substring(4,6),16);
    var iMax = Math.max(iRed,iGreen,iBlue);
    var iMin = Math.min(iRed,iGreen,iBlue);
    var iLum = Math.round((iMax+iMin)/2);
    if((iLum > 128) && (iLum < 192)) {
        iLum=192;
    } else if((iLum < 128) && (iLum > 64))
        iLum=64;
    else return sHex;
    var hsl=this.RGBtoHSL(iRed,iGreen,iBlue);
    var rgb=this.HSLtoRGB(hsl[0],hsl[1],iLum);
    var sRed = rgb[0].toString(16).toUpperCase();
    var sGreen = rgb[1].toString(16).toUpperCase();
    var sBlue = rgb[2].toString(16).toUpperCase();
    //make sure there are two digits in each code
    if (sRed.length == 1) {
        sRed = "0" + sRed;
    } //End: if (sRed.length == 1)
    if (sGreen.length == 1) {
        sGreen = "0" + sGreen;
    } //End: if (sGreen.length == 1)
    if (sBlue.length == 1) {
        sBlue = "0" + sBlue;
    } //End: if (sBlue.length == 1)

    //return the hex code
    return sRed + sGreen + sBlue;
}
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
String.prototype.compareColor = function(){
    if((this.indexOf("#") != -1 && arguments[0].indexOf("#") != -1) ||
        (this.indexOf("rgb") != -1 && arguments[0].indexOf("rgb") != -1)){
        return this.toLowerCase() == arguments[0].toLowerCase()
    }
    else{
        xCol_1 = this;
        xCol_2 = arguments[0];
        if(xCol_1.indexOf("#") != -1)xCol_1 = xCol_1.toRGBcolor();
        if(xCol_2.indexOf("#") != -1)xCol_2 = xCol_2.toRGBcolor();
        return xCol_1.toLowerCase() == xCol_2.toLowerCase()
    }
}
String.prototype.toRGBcolor = function(){
    varR = parseInt(this.substring(1,3), 16);
    varG = parseInt(this.substring(3,5), 16);
    varB = parseInt(this.substring(5,7), 16);
    return "rgb(" + varR + ", " + varG + ", " +  varB + ")";
}
var EnFolks_WaitingScore=false;
var EnFolks_Score_Plus=0;
var EnFolks_Score_Minus=0;
var EnFolks_Score_Score=0;
EnergyFolks.prototype.UpdateScore = function(id) {
    if(EnFolks_WaitingScore) {
        window.setTimeout(function(obj,id){return function() {obj.UpdateScore(id);};}(this,id),50);
        return;
    }
    this.result_data[id].plus=EnFolks_Score_Plus;
    this.result_data[id].minus=EnFolks_Score_Minus;
    this.result_data[id].score=EnFolks_Score_Score;
    var l=this.full_data.length;
    for(var i=0;i<l;i++) {
        if(this.full_data[i].id == this.result_data[id].id) {
            this.full_data[i].plus=EnFolks_Score_Plus;
            this.full_data[i].minus=EnFolks_Score_Minus;
            this.full_data[i].score=EnFolks_Score_Score;
            break;
        }
    }
}
EnergyFolks.prototype.GetInlineText = function(i,no_link) {
    var text;
    if("calendar" == this.type) {
        text="<h4 style='margin: 2px;'>";
        if(no_link != true) {
            if(this.logged) {
                var text2="<input type='image' id='spinner"+this.result_data[i].id+"' style='width:20px;display:inline;padding-right:4px;' src='https://images.energyfolks.com/images/icons/";
                if(this.result_data[i].selected)
                    text2+="minus";
                else
                    text2+="plus";
                if(this.enfolks) {
                    if(this.type == "announce")
                        text2+=".png' border=0 onmouseover='popup(\"<i>subscribe to / unsubscribe from<BR>email updates</i>\");' onmouseout='hidepopup();'>";
                    else
                        text2+=".png' border=0 onmouseover='popup(\"<i>Add to / remove from<BR>favorites</i>\");' onmouseout='hidepopup();'>";
                } else
                    text2+=".png' border=0>";
                text+=this.ReturnLink("javascript:;",function(obj,i,id,enfolks){return function(){obj.ToggleIt(i);EnFolks_get_object("spinner"+id).src="https://images.energyfolks.com/images/loader.gif";obj.AjaxRequest("https://www.energyfolks.com/"+obj.type+"/ToggleEvent/"+id+"/"+enfolks);};}(this,i,this.result_data[i].id,this.enfolks),"","text-decoration:none;border-width:0px;",text2);
            }
        }
        if(no_link)
            text+=this.result_data[i].name;
        else
            text+=this.ReturnLink("https://www.energyfolks.com/calendar/detail/" + this.result_data[i].id,function(obj,id){return function(){obj.ShowDetails(id);obj.HidePopup();return false;};}(this,this.result_data[i].id),"","",this.result_data[i].name);
        text+="</h4>";
        if(this.result_data[i].series_id > 0)
            text+="<b><a href='javascript:;' onclick='EnFolksMessageSize(\"https://www.energyfolks.com/calendar/SeriesdetailNon/"+this.affiliateid + "/" + this.result_data[i].series_id + "\",1000,600);event.cancelBubble = true;if(event.stopPropagation) event.stopPropagation();'>"+EnFolksLanguage.part_of_the_xxxxx_event_series1+"<i>" + this.result_data[i].series_name + "</i>"+EnFolksLanguage.part_of_the_xxxxx_event_series2+"</a></b><BR>";
        var start=this.result_data[i].start;
        var ender=this.result_data[i].end;
        var rsvp=this.result_data[i].rsvp_time;
        var earlybird=this.result_data[i].early_time;
        if(typeof this.result_data[i].realstart != "undefined")
            start=this.result_data[i].realstart;
        if(typeof this.result_data[i].realend != "undefined")
            ender=this.result_data[i].realend;
        if(typeof rsvp == undefined)
            rsvp=null;
        else if(isNaN(rsvp))
            rsvp=null;
        if(typeof earlybird == undefined)
            earlybird=null;
        else if(isNaN(earlybird))
            earlybird=null;
        if(EnFolks_get_object("EnfolksShowRSVP").checked) {
            text+=EnFolksLanguage.rsvp_by+": " + this.date(EnFolksLanguage.date_l_f_j_Y,rsvp) + "<BR>Event Date: ";
            text+=this.date(EnFolksLanguage.date_l_f_j_Y,start)+": ";
            text+=this.date(EnFolksLanguage.date_g_i_a,start) + " - " + this.date(EnFolksLanguage.date_g_i_a,ender);
            if(this.date(EnFolksLanguage.date_l_f_j_Y,start) != this.date(EnFolksLanguage.date_l_f_j_Y,ender))
                text+= " (next day)";
        } else if(EnFolks_get_object("EnfolksShowRSVPearly").checked) {
            text+=EnFolksLanguage.earlybird_deadline+": " + this.date(EnFolksLanguage.date_l_f_j_Y,earlybird) + "<BR>Event Date: ";
            text+=this.date(EnFolksLanguage.date_l_f_j_Y,start)+": ";
            text+=this.date(EnFolksLanguage.date_g_i_a,start) + " - " + this.date(EnFolksLanguage.date_g_i_a,ender);
            if(this.date(EnFolksLanguage.date_l_f_j_Y,start) != this.date(EnFolksLanguage.date_l_f_j_Y,ender))
                text+= " (next day)";
        } else {
            if((this.date(EnFolksLanguage.date_l_f_j_Y,start) != this.date(EnFolksLanguage.date_l_f_j_Y,ender)) && (typeof this.result_data[i].realend == "undefined"))
                text+="(previous day) ";
            if(this.calendar_type == 4)
                text+=this.date(EnFolksLanguage.date_l_f_j_Y,start)+": ";
            text+=this.date(EnFolksLanguage.date_g_i_a,start) + " - " + this.date(EnFolksLanguage.date_g_i_a,ender);
            if((this.date(EnFolksLanguage.date_l_f_j_Y,start) != this.date(EnFolksLanguage.date_l_f_j_Y,ender)) && (typeof this.result_data[i].realend != "undefined"))
                text+= " (next day)";
            if(earlybird != null)
                text+="<BR>"+EnFolksLanguage.earlybird_deadline+": " + this.date(EnFolksLanguage.date_l_f_j_Y,earlybird);
            if(rsvp != null)
                text+="<BR>"+EnFolksLanguage.rsvp_by+": " + this.date(EnFolksLanguage.date_l_f_j_Y,rsvp);
        }
        text+="<br>";
        if(this.result_data[i].type != 7)
            text+="<font class=supersmallfont>"+this.result_data[i].location+"</font><BR>";
        if(no_link != true) {
            text+= "<table border=0 width='100%' border=0><tr><td align=left>";
            text+= this.CreateAffiliatePopup(this.result_data[i].network,30,"Posted from website of<BR>");
            text+= "</td><td align=right style='text-align:right;'><span id='EnFolksScoreSpan" + this.result_data[i].id + "'>";
            text+= "<a href='javascript:;' id='EnFolks_Vote_Up" + this.result_data[i].id + "'><img src='https://images.energyfolks.com/images/icons/tup.png' width=17 height=17 style='display:inline;vertical-align: -4px' border=0></a>&nbsp;";
            text+= this.result_data[i].plus;
            text+= "&nbsp;&nbsp;<a href='javascript:;' id='EnFolks_Vote_Down" + this.result_data[i].id + "'><img src='https://images.energyfolks.com/images/icons/tdown.png' width=17 height=17 style='display:inline;vertical-align: -4px' border=0></a>&nbsp;";
            text+= this.result_data[i].minus;
            text+="</span> | ";
            text+=this.ReturnLink("javascript:;",function(obj,id){return function(){obj.ShowDetails(id);};}(this,this.result_data[i].id),"","",this.result_data[i].attending + EnFolksLanguage.attending) + " | ";
            if(this.result_data[i].totcomment == 1)
                text+=this.ReturnLink("javascript:;",function(obj,id){return function(){obj.ShowDetails(id);};}(this,this.result_data[i].id),"","",this.result_data[i].totcomment + EnFolksLanguage.review)+"</td></tr></table>";
            else
                text+=this.ReturnLink("javascript:;",function(obj,id){return function(){obj.ShowDetails(id);};}(this,this.result_data[i].id),"","",this.result_data[i].totcomment + EnFolksLanguage.reviews)+"</td></tr></table>";
            this.listener_array.push({id:'EnFolks_Vote_Up' + this.result_data[i].id,script:function(obj,i) {return function() {EnFolks_WaitingScore=true;window.setTimeout(function() {obj.UpdateScore(i);},50);EnFolks_Vote_Small(1,obj.result_data[i].id,obj.result_data[i].end);EnFolks_get_object("EnFolksScoreSpan" + obj.result_data[i].id).innerHTML="<img width=12 class=inline src=https://images.energyfolks.com/images/loader.gif border=0> "+EnFolksLanguage.loading+"...";};}(this,i)});
            this.listener_array.push({id:'EnFolks_Vote_Down' + this.result_data[i].id,script:function(obj,i) {return function() {EnFolks_WaitingScore=true;window.setTimeout(function() {obj.UpdateScore(i);},50);EnFolks_Vote_Small(0,obj.result_data[i].id,obj.result_data[i].end);EnFolks_get_object("EnFolksScoreSpan" + obj.result_data[i].id).innerHTML="<img width=12 class=inline src=https://images.energyfolks.com/images/loader.gif border=0> "+EnFolksLanguage.loading+"...";};}(this,i)});
        }
        return text;
    }
    if("jobs" == this.type) {
        type=["","One-Time","Internship/Fellowship","Part Time","Full Time"];
        text="";
        if(this.result_data[i].pic != null)
            text="<img style='display:inline;float:right;' align=right src='https://www.energyfolks.com/resourceimage/" +this.result_data[i].pic+ ".png' border=0 width=120>";
        text+="<h4 style='margin: 2px;'>";
        if(no_link != true) {
            if(this.logged) {
                var text2="<input type='image' id='spinner"+this.result_data[i].id+"' style='width:20px;display:inline;padding-right:4px;' src='https://images.energyfolks.com/images/icons/";
                if(this.result_data[i].selected)
                    text2+="unpin";
                else
                    text2+="pin";
                if(this.enfolks) {
                    if(this.type == "announce")
                        text2+=".png' border=0 onmouseover='popup(\"<i>subscribe to / unsubscribe from<BR>email updates</i>\");' onmouseout='hidepopup();'>";
                    else
                        text2+=".png' border=0 onmouseover='popup(\"<i>Add to / remove from<BR>favorites</i>\");' onmouseout='hidepopup();'>";
                } else
                    text2+=".png' border=0>";
                text+=this.ReturnLink("javascript:;",function(obj,i,id,enfolks){return function(){obj.ToggleIt(i);EnFolks_get_object("spinner"+id).src="https://images.energyfolks.com/images/loader.gif";obj.AjaxRequest("https://www.energyfolks.com/"+obj.type+"/ToggleEvent/"+id+"/"+enfolks);};}(this,i,this.result_data[i].id,this.enfolks),"","text-decoration:none;border-width:0px;",text2);
            }
        }
        if(no_link)
            text+=this.result_data[i].name;
        else
            text+=this.ReturnLink("https://www.energyfolks.com/jobs/detail/" + this.result_data[i].id,function(obj,id){return function(){obj.ShowDetails(id);return false;};}(this,this.result_data[i].id),"","",this.result_data[i].name);
        text+= "</h4>";
        text+= "<b>" + this.result_data[i].employer + " (";
        text+= this.result_data[i].location + ")</b>";
        text+= "<BR><i>"+EnFolksLanguage.posted_on_xxx+" " + EnFolks_date(EnFolksLanguage.date_m_d_y,this.result_data[i].time) + ", "+EnFolksLanguage.expires_on_xxx+" " + EnFolks_date(EnFolksLanguage.date_m_d_y,this.result_data[i].expire) + "</i>";
        text+= "<BR>Job type: " + type[this.result_data[i].type];
        if(no_link != true) {
            text+= "<table border=0 width='100%' border=0><tr><td align=left>";
            text+= this.CreateAffiliatePopup(this.result_data[i].network,30,"Posted from website of<BR>");
            text+="</td></tr></table>";
        }
        //text+=this.ReturnLink("https://www.energyfolks.com/jobs/detail/" + this.result_data[i].id,function(obj,id){return function(){obj.ShowDetails(id);return false;};}(this,this.result_data[i].id),"","","More information...");
        return text;
    }
    if("users" == this.type) {
        text="<table border=0 width='100%'><tr><td width=50>";
        if (this.result_data[i].avatar == null)
            var linktext= "<img style='max-height:65px;max-width:50px;' border=0 src='https://www.energyfolks.com/userimages/noimage.png'>";
        else
            var linktext= "<img style='max-height:65px;max-width:50px;' border=0 src='https://www.energyfolks.com/userimages/"+ this.result_data[i].avatar + ".png'>";
        text+=this.ReturnLink("https://www.energyfolks.com/users/profile/" + this.result_data[i].id,function(obj,id){return function(){obj.ShowDetails(id);return false;};}(this,this.result_data[i].id),"","",linktext);
        text+="</td><td style='vertical-align:top;padding:1px;width:";
        if(this.result_data[i].all_partners == null) this.result_data[i].all_partners='';
        var parts = this.result_data[i].all_partners.split(",");
        if(parts.length == 0) parts=[0];
        text+=Math.ceil(parts.length/3)*22+"px;'><div style='height:65px;width:"+Math.ceil(parts.length/3)*22+"px;position:relative;'>";
        var top=0;
        var left=0;
        for(var m=0;m<parts.length;m++) {
            text+="<div style='position:absolute;top:"+top+"px;left:"+left+"px;padding:0px;'>"+this.CreateAffiliatePopup(parts[m]*1,20,"User is a member of<BR>")+"</div>";
            top+=22;
            if((m % 3) == 2) {
                top=0;
                left+=22;
            }
        }
        text+="<td style='vertical-align:top;'><h4 style='margin: 2px;'>";
        text+=this.result_data[i].first_name+" "+this.result_data[i].last_name;
        text+='</h4>';
        if (("" != this.result_data[i].position) && (this.result_data[i].position != "<NEWUSER/>") && (this.result_data[i].position != null))
            text+= "<b>" +this.result_data[i].position+ "</b><BR>";
        if(("" != this.result_data[i].company) && (this.result_data[i].company != null))
            text+="<i>" + this.result_data[i].company + "</i><BR>";
        if ((this.result_data[i].linkedin != "") && (this.result_data[i].linkedin != null)) {
            text+= "</td><td width=40 align=center><a href='" +this.result_data[i].linkedin+ "' border=0 target='_blank'><img border=0 src='https://images.energyfolks.com/images/icons/linkedin.png' ";
            if(this.enfolks)
                text+="onmouseover=\"popup('This user has linked<BR>their profile to their<BR>LinkedIn account.<BR>Click to view.');\" onmouseout='hidepopup();'";
            text+="></a>";
        }
        text+='</td></tr></table>';
        return text;
    }
    if(("announce" == this.type) || (this.type == 'blog')) {
        text="<h4 style='margin: 2px;'>";
        if(no_link != true) {
            if(this.logged) {
                var text2="<input type='image' id='spinner"+this.result_data[i].id+"' style='width:20px;display:inline;padding-right:4px;' src='https://images.energyfolks.com/images/icons/";
                if(this.result_data[i].selected)
                    text2+="unpin";
                else
                    text2+="pin";
                if(this.enfolks) {
                    if(this.type == "announce")
                        text2+=".png' border=0 onmouseover='popup(\"<i>subscribe to / unsubscribe from<BR>email updates</i>\");' onmouseout='hidepopup();'>";
                    else
                        text2+=".png' border=0 onmouseover='popup(\"<i>Add to / remove from<BR>favorites</i>\");' onmouseout='hidepopup();'>";
                } else
                    text2+=".png' border=0>";
                text+=this.ReturnLink("javascript:;",function(obj,i,id,enfolks){return function(){obj.ToggleIt(i);EnFolks_get_object("spinner"+id).src="https://images.energyfolks.com/images/loader.gif";obj.AjaxRequest("https://www.energyfolks.com/"+obj.type+"/ToggleEvent/"+id+"/"+enfolks);};}(this,i,this.result_data[i].id,this.enfolks),"","text-decoration:none;border-width:0px;",text2);
            }
        }
        if(this.longformat || !no_link)
            text+=this.ReturnLink("https://www.energyfolks.com/"+this.type+"/detail/" + this.result_data[i].id,function(obj,id){return function(){obj.ShowDetails(id);return false;};}(this,this.result_data[i].id),"","",this.result_data[i].name);
        else
            text+=this.result_data[i].name;
        text+="</h4>";
        if(no_link && this.longformat) {
            if(this.result_data[i].owner_id < 1) {
                text+="<table border=0><tr><td style='vertical-align:top;'><img class=inline align=right width=90 border=0 padding=3 src='https://www.energyfolks.com/userimages/noimage.png'>";
                text+="</td><td align=left style='vertical-align:top;'><b>energyfolks administrator</b><BR>"+EnFolksLanguage.posted_on_xxx+" " + EnFolks_date(EnFolksLanguage.date_m_d_y,this.result_data[i].time)+"</td></tr></table>";
            } else {
                text+="<table border=0><tr><td style='vertical-align:top;'><a href='https://www.energyfolks.com/users/profile/"+this.result_data[i].user_id+"' border=0>";
                if (this.result_data[i].avatar == null)
                    text+="<img class=inline align=right width=90 border=0 style='padding:4px;' src='https://www.energyfolks.com/userimages/noimage.png'>";
                else
                    text+="<img class=inline align=right width=90 border=0 style='padding:4px;' src='https://www.energyfolks.com/userimages/"+this.result_data[i].avatar+".png'>";
                text+="</a></td><td align=left style='vertical-align:top;'><b><a href='https://www.energyfolks.com/users/profile/"+this.result_data[i].user_id+"' border=0>";
                text+=this.result_data[i].first_name + " " + this.result_data[i].last_name+"</a></b><BR>"+EnFolksLanguage.posted_on_xxx+" " + EnFolks_date(EnFolksLanguage.date_m_d_y,this.result_data[i].time)+"</td></tr></table>";
            }
        }
        if(!this.longformat) {
            text+= "<span id='EnFolksScoreSpan" + this.result_data[i].id + "'>";
            text+= "<a href='javascript:event.cancelBubble = true;if(event.stopPropagation) event.stopPropagation();' id='EnFolks_Vote_Up" + this.result_data[i].id + "'><img src='https://images.energyfolks.com/images/icons/tup.png' width=17 height=17 style='display:inline;vertical-align: -4px' border=0></a>&nbsp;";
            text+= this.result_data[i].plus;
            text+= "&nbsp;&nbsp;<a href='javascript:event.cancelBubble = true;if(event.stopPropagation) event.stopPropagation();' id='EnFolks_Vote_Down" + this.result_data[i].id + "'><img src='https://images.energyfolks.com/images/icons/tdown.png' width=17 height=17 style='display:inline;vertical-align: -4px' border=0></a>&nbsp;";
            text+= this.result_data[i].minus;
            text+="</span> | ";
            this.listener_array.push({id:'EnFolks_Vote_Up'+ this.result_data[i].id,script:function(obj,i) {return function() {event.cancelBubble = true;if(event.stopPropagation) event.stopPropagation();EnFolks_WaitingScore=true;window.setTimeout(function() {obj.UpdateScore(i);},50);EnFolks_Vote_Small_Announce(1,obj.result_data[i].id);EnFolks_get_object("EnFolksScoreSpan" + obj.result_data[i].id).innerHTML="<img width=12 class=inline src=https://images.energyfolks.com/images/loader.gif border=0> "+EnFolksLanguage.loading+"...";return true;};}(this,i)});
            this.listener_array.push({id:'EnFolks_Vote_Down'+ this.result_data[i].id,script:function(obj,i) {return function() {event.cancelBubble = true;if(event.stopPropagation) event.stopPropagation();EnFolks_WaitingScore=true;window.setTimeout(function() {obj.UpdateScore(i);},50);EnFolks_Vote_Small_Announce(0,obj.result_data[i].id);EnFolks_get_object("EnFolksScoreSpan" + obj.result_data[i].id).innerHTML="<img width=12 class=inline src=https://images.energyfolks.com/images/loader.gif border=0> "+EnFolksLanguage.loading+"...";return true;};}(this,i)});
            if(this.result_data[i].totcomment == 1)
                text+=this.ReturnLink("javascript:;",function(obj,id){return function(){obj.ShowDetails(id);};}(this,this.result_data[i].id),"","",this.result_data[i].totcomment + EnFolksLanguage.comment);
            else
                text+=this.ReturnLink("javascript:;",function(obj,id){return function(){obj.ShowDetails(id);};}(this,this.result_data[i].id),"","",this.result_data[i].totcomment + EnFolksLanguage.comments);
        }
        if(no_link && this.longformat) {
            text+="<div style='max-height:1000px;overflow:hidden;margin:0px;padding:0px;'>"+this.result_data[i].html+"<BR><span id='EnFolksLengthTest"+i+"'></span></div>";
            text+="<div style='position:relative;top:-8px;height:8px;padding:0px;margin:0px;background-image:url(https://images.energyfolks.com/images/calendar/fadewhiteROT.png);background-repeat:repeat-x;'></div>";
            text+="<div style='display:none;position:relative;top:-6px;text-align:right;font-size:16px;' id='EnFolksLengthTestDet"+i+"'>"+this.ReturnLink("https://www.energyfolks.com/"+this.type+"/detail/" + this.result_data[i].id,function(obj,id){return function(){obj.ShowDetails(id);return false;};}(this,this.result_data[i].id),"","","<i>View the entire post</i>")+"</div>";
            window.setTimeout(function(i) {return function() {
                if((EnFolks_get_object("EnFolksLengthTest"+i).offsetTop+EnFolks_get_object("EnFolksLengthTest"+i).offsetHeight) > 1000)
                    EnFolks_get_object("EnFolksLengthTestDet"+i).style.display='block';
            };}(i),500);
            text+= "<div style='text-align:right;'><table border=0 border=0 align=right><tr><td align=right style='padding-right:5px;'>";
            text+= this.CreateAffiliatePopup(this.result_data[i].network,18,"Posted from website of<BR>");
            text+="</td><td align=right style='text-align:right;white-space:nowrap;'><span id='EnFolksScoreSpan" + this.result_data[i].id + "'>";
            text+= "<a href='javascript:;' id='EnFolks_Vote_Up'><img src='https://images.energyfolks.com/images/icons/tup.png' width=17 height=17 style='display:inline;vertical-align: -4px' border=0></a>&nbsp;";
            text+= this.result_data[i].plus;
            text+= "&nbsp;&nbsp;<a href='javascript:;' id='EnFolks_Vote_Down'><img src='https://images.energyfolks.com/images/icons/tdown.png' width=17 height=17 style='display:inline;vertical-align: -4px' border=0></a>&nbsp;";
            text+= this.result_data[i].minus;
            text+="</span> | ";
            this.listener_array.push({id:'EnFolks_Vote_Up',script:function(obj,i) {return function() {EnFolks_WaitingScore=true;window.setTimeout(function() {obj.UpdateScore(i);},50);EnFolks_Vote_Small_Announce(1,obj.result_data[i].id);EnFolks_get_object("EnFolksScoreSpan" + obj.result_data[i].id).innerHTML="<img width=12 class=inline src=https://images.energyfolks.com/images/loader.gif border=0> "+EnFolksLanguage.loading+"...";};}(this,i)});
            this.listener_array.push({id:'EnFolks_Vote_Down',script:function(obj,i) {return function() {EnFolks_WaitingScore=true;window.setTimeout(function() {obj.UpdateScore(i);},50);EnFolks_Vote_Small_Announce(0,obj.result_data[i].id);EnFolks_get_object("EnFolksScoreSpan" + obj.result_data[i].id).innerHTML="<img width=12 class=inline src=https://images.energyfolks.com/images/loader.gif border=0> "+EnFolksLanguage.loading+"...";};}(this,i)});
            if(this.result_data[i].totcomment == 1)
                text+=this.ReturnLink("javascript:;",function(obj,id){return function(){obj.ShowDetails(id);};}(this,this.result_data[i].id),"","",this.result_data[i].totcomment + EnFolksLanguage.comment)+" | ";
            else
                text+=this.ReturnLink("javascript:;",function(obj,id){return function(){obj.ShowDetails(id);};}(this,this.result_data[i].id),"","",this.result_data[i].totcomment + EnFolksLanguage.comments)+" | ";
            if(this.result_data[i].views == 1)
                text+=this.ReturnLink("javascript:;",function(obj,id){return function(){obj.ShowDetails(id);};}(this,this.result_data[i].id),"","",this.result_data[i].views + " "+EnFolksLanguage.totview)+"</td></tr></table></div>";
            else
                text+=this.ReturnLink("javascript:;",function(obj,id){return function(){obj.ShowDetails(id);};}(this,this.result_data[i].id),"","",this.result_data[i].views + " "+EnFolksLanguage.totviews)+"</td></tr></table></div>";
            text+="<div class='enfolks_share' style=''><div onclick='EnFolksShareIt(this,\"facebook\","+this.result_data[i].id+",\"https://www.energyfolks.com/"+this.type+"/detail/"+this.result_data[i].id+"\",\""+escape(this.result_data[i].name)+"\");' class=\"share facebook_share\"  share_type=\"facebook\">"+this.result_data[i].share_facebook+"</div>";
            text+="<div onclick='EnFolksShareIt(this,\"twitter\","+this.result_data[i].id+",\"https://www.energyfolks.com/"+this.type+"/detail"+this.result_data[i].id+"\",\""+escape(this.result_data[i].name)+"\");' class=\"share twitter_share\"  share_type=\"twitter\">"+this.result_data[i].share_twitter+"</div>";
            text+="<div onclick='EnFolksShareIt(this,\"linkedin\","+this.result_data[i].id+",\"https://www.energyfolks.com/"+this.type+"/detail"+this.result_data[i].id+"\",\""+escape(this.result_data[i].name)+"\");' class=\"share linkedin_share\"  share_type=\"twitter\">"+this.result_data[i].share_linkedin+"</div>";
            text+='<span class="google_plus"><div class="g-plusone" data-size="small" data-href="https://www.energyfolks.com/'+this.type+'/detail/'+this.result_data[i].id+'></div></span><span class="email_print">';
            text+="<a rel='nofollow' border=0 href='javascript:;' onclick='window.open(\"https://www.energyfolks.com/welcome/printit/Announce_detail/"+this.result_data[i].id+"/"+EnFolksAffiliateId+"\",\"printwin\");' target='_blank'><img class=\"print_image inline\" align=absmiddle> print</a>";
            text+="&nbsp;&nbsp;&nbsp;<a rel='nofollow' border=0 href='javascript:;' onclick='EnFolksMessageSize(\"https://www.energyfolks.com/welcome/emailittop/Announce_detail/"+this.result_data[i].id+"/"+EnFolksAffiliateId+"\",550,500);'><img class=\"email_image inline\" align=absmiddle> email</a></span></div>";
        }
        if(no_link != true) {
            text+= "<table border=0 width='100%' border=0><tr><td align=left>";
            text+= this.CreateAffiliatePopup(this.result_data[i].network,30,"Posted from website of<BR>");
            text+="</td><td align=right style='text-align:right;'>";
            if(this.result_data[i].owner_id < 1) {
                text+=" " + EnFolksLanguage.posted_by_xxx + " energyfolks administrator";
            } else {
                text+=" " + EnFolksLanguage.posted_by_xxx+ "<a onclick='event.cancelBubble = true;if(event.stopPropagation) event.stopPropagation();return true;' href='https://www.energyfolks.com/users/profile/"+this.result_data[i].user_id+"' border=0>";
                if (this.result_data[i].avatar == null)
                    text+="<img align=abdmiddle height=20 border=0 style='height:20px;padding:1px 5px 1px 5px;display:inline;text-decoration:none;vertical-align:middle;' src='https://www.energyfolks.com/userimages/noimage.png'>";
                else
                    text+="<img align=absmiddle height=20 border=0 style='height:20px;padding:1px 5px 1px 5px;display:inline;text-decoration:none;' src='https://www.energyfolks.com/userimages/"+this.result_data[i].avatar+".png'>";
                text+="</a><a onclick='event.cancelBubble = true;if(event.stopPropagation) event.stopPropagation();return true;' href='https://www.energyfolks.com/users/profile/"+this.result_data[i].user_id+"' border=0>";
                text+=this.result_data[i].first_name + " " + this.result_data[i].last_name+"</a>";
            }
            text+= '<BR><span style="color:#666666;">'+ EnFolks_date(EnFolksLanguage.date_m_d_y,this.result_data[i].time)+'</span></td></tr></table>';
        }
        if(this.mod_view) {
            if((this.result_data[i].htype > 0) && !(this.result_data[i].ntype > 0))
                text+="<div onclick='event.cancelBubble = true;if(event.stopPropagation) event.stopPropagation();EnFolksMessageSize(\"https://www.energyfolks.com/"+this.type+"/edit/" + this.result_data[i].id + "/0/"+EnFolksAffiliateId+"\",1000,570);return true;' style='cursor:pointer;background-color:darkred;color:white;text-align:center;'>WARNING: Item is in thread hidden to your group.  Click here to edit post and change thread to something visible to your group.</div>";
        }
        return text;
    }
    return text;
}
EnergyFolks.prototype.GetDetailDiv = function() {
    return this.detail_div;
}
EnergyFolks.prototype.loading = function(div_name) {
    var high=(EnFolks_get_object(div_name).offsetHeight);
    if(high > 140) high=140;
    EnFolks_get_object(div_name).innerHTML='<div align=center><img style="display:block;" src=https://images.energyfolks.com/images/blank.gif height=' + high + ' width=1 border=0><div style="height:200px;vertical-align:center;align:center;"><h5>'+EnFolksLanguage.loading+'...</h5><img class="inline" src="https://images.energyfolks.com/images/loader.gif" border=0></div></div>';
    EnFolks_get_object(div_name).style.display='block';
}
EnergyFolks.prototype.BeginTable = function(classname,style) {
    text="<table cellpadding=0 cellspacing=0 border=0 width='100%'";
    if(classname != "") text+=" class='" + classname + "'";
    if(style != "") text+=" style='" + style + "'";
    text+=">";
    this.div_builder+=text;
}
EnergyFolks.prototype.InsertHTML=function(html) {
    this.div_builder+=html;
}
EnergyFolks.prototype.AddBlank=function() {
    this.div_builder+="<img style='display:block;' src='https://images.energyfolks.com/images/blank.gif' width=1 height=1 border=0>";
}
EnergyFolks.prototype.ReturnLink=function(href,onclick,classname,style,display_text,ranid) {
    text="<a href='" + href + "'";
    if(onclick != "") {
        if(ranid > 0) ran=ranid; else
            ran=Math.floor(Math.random()*100000000000);
        text+=" id='AID"+ran+"'";
        this.listener_array.push({'id':"AID"+ran,'script':onclick});
    }
    if(classname != "") text+=" class='" + classname + "'";
    if(style != "") text+=" style='" + style + "'";
    text+=">" + display_text + "</a>";
    return text;
}
EnergyFolks.prototype.ClearBuffer=function() {
    this.div_builder="";
    this.listener_array=new Array();
}
EnergyFolks.prototype.EndTable = function() {
    this.div_builder+="</table>";
}
EnergyFolks.prototype.BeginRow = function(classname,style) {
    text="<tr";
    if(classname != "") text+=" class='" + classname + "'";
    if(style != "") text+=" style='" + style + "'";
    text+=">";
    this.div_builder+=text;
}
EnergyFolks.prototype.EndRow = function() {
    this.div_builder+="</tr>";
}
EnergyFolks.prototype.BeginCell = function(classname,style,id) {
    text="<td";
    if(classname != "") text+=" class='" + classname + "'";
    if(style != "") text+=" style='" + style + "'";
    if(id != "") text+=" id='" + id + "'";
    text+=">";
    this.div_builder+=text;
}
EnergyFolks.prototype.EndCell = function() {
    this.div_builder+="</td>";
}
EnergyFolks.prototype.PrintBuffer = function(addit) {
    if(typeof addit != 'undefined') {
        if(addit == 0) var divname=this.div_name; else var divname=this.div_name+"list"+addit;
        EnFolks_get_object(divname).innerHTML=this.div_builder;
    } else
        EnFolks_get_object(this.div_name).innerHTML=this.div_builder;
    this.div_builder="";
    for(i=0;i<this.listener_array.length;i++) {
        EnFolks_get_object(this.listener_array[i].id).onclick=this.listener_array[i].script;
    }
    this.listener_array=new Array();
}
EnergyFolks.prototype.FlushBuffer = function() {
    text=this.div_builder;
    this.div_builder="";
    return text;
}
EnergyFolks.prototype.strip_tags = function(input) {
    allowed="";
    allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
        commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
    return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
        return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
    });
}
function EnFolks_Show_Tab(tabid,total) {
    for(var k=1;k<=total;k++) {
        EnFolks_get_object("EnFolks_Tab"+k).style.backgroundColor='#eeeeee';
        EnFolks_get_object("EnFolks_Tab"+k).style.color='#'+EnFolks_Default_Color;
        EnFolks_get_object("EnFolks_Tab_Body"+k).style.display='none';
    }
    EnFolks_get_object("EnFolks_Tab"+tabid).style.backgroundColor='#'+EnFolks_Default_Color;
    EnFolks_get_object("EnFolks_Tab"+tabid).style.color='#eeeeee';
    EnFolks_get_object("EnFolks_Tab_Body"+tabid).style.display='block';
}
function EnFolks_Show_Tabb(tabid,total) {
    for(var k=1;k<=total;k++) {
        EnFolks_get_object("bEnFolks_Tab"+k).style.backgroundColor='#eeeeee';
        EnFolks_get_object("bEnFolks_Tab"+k).style.color='#'+EnFolks_Default_Color;
        EnFolks_get_object("bEnFolks_Tab_Body"+k).style.display='none';
    }
    EnFolks_get_object("bEnFolks_Tab"+tabid).style.backgroundColor='#'+EnFolks_Default_Color;
    EnFolks_get_object("bEnFolks_Tab"+tabid).style.color='#eeeeee';
    EnFolks_get_object("bEnFolks_Tab_Body"+tabid).style.display='block';
}
function EnFolks_gmdate(format, timestamp) {
    // Format a GMT date/time
    //
    // version: 1103.1210
    // discuss at: http://phpjs.org/functions/gmdate
    // +   original by: Brett Zamir (http://brett-zamir.me)
    // +   input by: Alex
    // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
    // -    depends on: date
    // *     example 1: gmdate('H:m:s \\m \\i\\s \\m\\o\\n\\t\\h', 1062402400); // Return will depend on your timezone
    // *     returns 1: '07:09:40 m is month'
    var dt = ((typeof(timestamp) == 'undefined') ? new Date() : // Not provided
        (typeof(timestamp) == 'object') ? new Date(timestamp) : // Javascript Date()
            new Date(timestamp * 1000) // UNIX timestamp (auto-convert to int)
        );
    timestamp = Date.parse(dt.toUTCString().slice(0, -4)) / 1000;
    return EnFolks_date(format, timestamp);
}
function EnFolks_date(format, timestamp) {
    var that = this,
        jsdate, f, formatChr = /\\?([a-z])/gi,
        formatChrCb,
    // Keep this here (works, but for code commented-out
    // below for file size reasons)
    //, tal= [],
        _pad = function (n, c) {
            if ((n = n + "").length < c) {
                return new Array((++c) - n.length).join("0") + n;
            } else {
                return n;
            }
        },
        txt_words = [EnFolksLanguage.sunday, EnFolksLanguage.monday, EnFolksLanguage.tuesday, EnFolksLanguage.wednesday, EnFolksLanguage.thursday, EnFolksLanguage.friday, EnFolksLanguage.saturday, EnFolksLanguage.january, EnFolksLanguage.february, EnFolksLanguage.march, EnFolksLanguage.april, EnFolksLanguage.may, EnFolksLanguage.june, EnFolksLanguage.july, EnFolksLanguage.august, EnFolksLanguage.september, EnFolksLanguage.october, EnFolksLanguage.november, EnFolksLanguage.december],
        txt_ordin = {
            1: "st",
            2: "nd",
            3: "rd",
            21: "st",
            22: "nd",
            23: "rd",
            31: "st"
        };
    formatChrCb = function (t, s) {
        return f[t] ? f[t]() : s;
    };
    f = {
        // Day
        d: function () { // Day of month w/leading 0; 01..31
            return _pad(f.j(), 2);
        },
        D: function () { // Shorthand day name; Mon...Sun
            return f.l().slice(0, 3);
        },
        j: function () { // Day of month; 1..31
            return jsdate.getDate();
        },
        l: function () { // Full day name; Monday...Sunday
            return txt_words[f.w()];// + 'day';
        },
        N: function () { // ISO-8601 day of week; 1[Mon]..7[Sun]
            return f.w() || 7;
        },
        S: function () { // Ordinal suffix for day of month; st, nd, rd, th
            return txt_ordin[f.j()] || 'th';
        },
        w: function () { // Day of week; 0[Sun]..6[Sat]
            return jsdate.getDay();
        },
        z: function () { // Day of year; 0..365
            var a = new Date(f.Y(), f.n() - 1, f.j()),
                b = new Date(f.Y(), 0, 1);
            return Math.round((a - b) / 864e5) + 1;
        },

        // Week
        W: function () { // ISO-8601 week number
            var a = new Date(f.Y(), f.n() - 1, f.j() - f.N() + 3),
                b = new Date(a.getFullYear(), 0, 4);
            return 1 + Math.round((a - b) / 864e5 / 7);
        },

        // Month
        F: function () { // Full month name; January...December
            return txt_words[6 + f.n()];
        },
        m: function () { // Month w/leading 0; 01...12
            return _pad(f.n(), 2);
        },
        M: function () { // Shorthand month name; Jan...Dec
            return f.F().slice(0, 3);
        },
        n: function () { // Month; 1...12
            return jsdate.getMonth() + 1;
        },
        t: function () { // Days in month; 28...31
            return (new Date(f.Y(), f.n(), 0)).getDate();
        },

        // Year
        L: function () { // Is leap year?; 0 or 1
            return new Date(f.Y(), 1, 29).getMonth() === 1 | 0;
        },
        o: function () { // ISO-8601 year
            var n = f.n(),
                W = f.W(),
                Y = f.Y();
            return Y + (n === 12 && W < 9 ? -1 : n === 1 && W > 9);
        },
        Y: function () { // Full year; e.g. 1980...2010
            return jsdate.getFullYear();
        },
        y: function () { // Last two digits of year; 00...99
            return (f.Y() + "").slice(-2);
        },

        // Time
        a: function () { // am or pm
            return jsdate.getHours() > 11 ? "pm" : "am";
        },
        A: function () { // AM or PM
            return f.a().toUpperCase();
        },
        B: function () { // Swatch Internet time; 000..999
            var H = jsdate.getUTCHours() * 36e2,
            // Hours
                i = jsdate.getUTCMinutes() * 60,
            // Minutes
                s = jsdate.getUTCSeconds(); // Seconds
            return _pad(Math.floor((H + i + s + 36e2) / 86.4) % 1e3, 3);
        },
        g: function () { // 12-Hours; 1..12
            return f.G() % 12 || 12;
        },
        G: function () { // 24-Hours; 0..23
            return jsdate.getHours();
        },
        h: function () { // 12-Hours w/leading 0; 01..12
            return _pad(f.g(), 2);
        },
        H: function () { // 24-Hours w/leading 0; 00..23
            return _pad(f.G(), 2);
        },
        i: function () { // Minutes w/leading 0; 00..59
            return _pad(jsdate.getMinutes(), 2);
        },
        s: function () { // Seconds w/leading 0; 00..59
            return _pad(jsdate.getSeconds(), 2);
        },
        u: function () { // Microseconds; 000000-999000
            return _pad(jsdate.getMilliseconds() * 1000, 6);
        },

        // Timezone
        e: function () { // Timezone identifier; e.g. Atlantic/Azores, ...
            // The following works, but requires inclusion of the very large
            // timezone_abbreviations_list() function.
            /*              return this.date_default_timezone_get();
             */
            throw 'Not supported (see source code of date() for timezone on how to add support)';
        },
        I: function () { // DST observed?; 0 or 1
            // Compares Jan 1 minus Jan 1 UTC to Jul 1 minus Jul 1 UTC.
            // If they are not equal, then DST is observed.
            var a = new Date(f.Y(), 0),
            // Jan 1
                c = Date.UTC(f.Y(), 0),
            // Jan 1 UTC
                b = new Date(f.Y(), 6),
            // Jul 1
                d = Date.UTC(f.Y(), 6); // Jul 1 UTC
            return 0 + ((a - c) !== (b - d));
        },
        O: function () { // Difference to GMT in hour format; e.g. +0200
            var a = jsdate.getTimezoneOffset();
            return (a > 0 ? "-" : "+") + _pad(Math.abs(a / 60 * 100), 4);
        },
        P: function () { // Difference to GMT w/colon; e.g. +02:00
            var O = f.O();
            return (O.substr(0, 3) + ":" + O.substr(3, 2));
        },
        T: function () { // Timezone abbreviation; e.g. EST, MDT, ...
            // The following works, but requires inclusion of the very
            // large timezone_abbreviations_list() function.
            /*              var abbr = '', i = 0, os = 0, default = 0;
             if (!tal.length) {
             tal = that.timezone_abbreviations_list();
             }
             if (that.php_js && that.php_js.default_timezone) {
             default = that.php_js.default_timezone;
             for (abbr in tal) {
             for (i=0; i < tal[abbr].length; i++) {
             if (tal[abbr][i].timezone_id === default) {
             return abbr.toUpperCase();
             }
             }
             }
             }
             for (abbr in tal) {
             for (i = 0; i < tal[abbr].length; i++) {
             os = -jsdate.getTimezoneOffset() * 60;
             if (tal[abbr][i].offset === os) {
             return abbr.toUpperCase();
             }
             }
             }
             */
            return 'UTC';
        },
        Z: function () { // Timezone offset in seconds (-43200...50400)
            return -jsdate.getTimezoneOffset() * 60;
        },

        // Full Date/Time
        c: function () { // ISO-8601 date.
            return 'Y-m-d\\Th:i:sP'.replace(formatChr, formatChrCb);
        },
        r: function () { // RFC 2822
            return 'D, d M Y H:i:s O'.replace(formatChr, formatChrCb);
        },
        U: function () { // Seconds since UNIX epoch
            return jsdate.getTime() / 1000 | 0;
        }
    };
    this.date = function (format, timestamp) {
        that = this;
        jsdate = ((typeof timestamp === 'undefined') ? new Date() : // Not provided
            (timestamp instanceof Date) ? new Date(timestamp) : // JS Date()
                new Date(timestamp * 1000) // UNIX timestamp (auto-convert to int)
            );
        return format.replace(formatChr, formatChrCb);
    };
    return this.date(format, timestamp);
}
function EnFolks_mktime() {
    var d = new Date(),
        r = arguments,
        i = 0,
        e = ['Hours', 'Minutes', 'Seconds', 'Month', 'Date', 'FullYear'];

    for (i = 0; i < e.length; i++) {
        if (typeof r[i] === 'undefined') {
            r[i] = d['get' + e[i]]();
            r[i] += (i === 3); // +1 to fix JS months.
        } else {
            r[i] = parseInt(r[i], 10);
            if (isNaN(r[i])) {
                return false;
            }
        }
    }

    // Map years 0-69 to 2000-2069 and years 70-100 to 1970-2000.
    r[5] += (r[5] >= 0 ? (r[5] <= 69 ? 2e3 : (r[5] <= 100 ? 1900 : 0)) : 0);

    // Set year, month (-1 to fix JS months), and date.
    // !This must come before the call to setHours!
    d.setFullYear(r[5], r[3] - 1, r[4]);

    // Set hours, minutes, and seconds.
    d.setHours(r[0], r[1], r[2]);

    // Divide milliseconds by 1000 to return seconds and drop decimal.
    // Add 1 second if negative or it'll be off from PHP by 1 second.
    return (d.getTime() / 1e3 >> 0) - (d.getTime() < 0);
}
function EnFolks_gmmktime() {
    var d = new Date(),
        r = arguments,
        i = 0,
        e = ['Hours', 'Minutes', 'Seconds', 'Month', 'Date', 'FullYear'];

    for (i = 0; i < e.length; i++) {
        if (typeof r[i] === 'undefined') {
            r[i] = d['getUTC' + e[i]]();
            r[i] += (i === 3); // +1 to fix JS months.
        } else {
            r[i] = parseInt(r[i], 10);
            if (isNaN(r[i])) {
                return false;
            }
        }
    }

    // Map years 0-69 to 2000-2069 and years 70-100 to 1970-2000.
    r[5] += (r[5] >= 0 ? (r[5] <= 69 ? 2e3 : (r[5] <= 100 ? 1900 : 0)) : 0);

    // Set year, month (-1 to fix JS months), and date.
    // !This must come before the call to setHours!
    d.setUTCFullYear(r[5], r[3] - 1, r[4]);

    // Set hours, minutes, and seconds.
    d.setUTCHours(r[0], r[1], r[2]);

    // Divide milliseconds by 1000 to return seconds and drop decimal.
    // Add 1 second if negative or it'll be off from PHP by 1 second.
    return (d.getTime() / 1e3 >> 0) - (d.getTime() < 0);
}
EnergyFolks.prototype.RGBtoHSL = function (r,g,b) /*:zHSL */ {

    var iMax = Math.max(r, g, b);
    var iMin = Math.min(r, g, b);
    var iDelta = iMax-iMin;

    var iLum = Math.round((iMax+iMin)/2);
    var iHue = 0;
    var iSat = 0;

    if (iDelta > 0) {
        iSat = Math.ceil(((iLum < (0.5*255)) ? iDelta/(iMax + iMin) : iDelta/((2*255)-iMax-iMin))*255);

        var iRedC = (iMax-r)/iDelta;
        var iGreenC = (iMax-g)/iDelta;
        var iBlueC = (iMax-b)/iDelta;

        if (r == iMax) {
            iHue = iBlueC - iGreenC;
        } else if (g == iMax) {
            iHue = 2.0 + iRedC - iBlueC;
        } else {
            iHue = 4.0 + iGreenC - iRedC;
        }

        iHue /= 6.0;

        if (iHue < 0) {
            iHue += 1.0;
        }

        iHue = Math.round(iHue * 255);
    }

    return [iHue,iSat,iLum];
};
EnergyFolks.prototype.HSLtoRGB = function(h,s,l) {

    iHue = h/255;
    iSat = s/255;
    iLum = l/255;

    var iRed, iGreen, iBlue;

    if (iSat == 0) {
        iRed = iGreen = iBlue = iLum;
    } else {

        var m1, m2;

        if (iLum <= 0.5) {
            m2 = iLum * (1+iSat);
        } else {
            m2 = iLum + iSat - (iLum * iSat);
        }

        m1 = 2.0 * iLum - m2;

        hf2 = iHue + 1/3;
        if (hf2 < 0) hf2 = hf2 + 1;
        if (hf2 > 1) hf2 = hf2 - 1;
        if (6 * hf2 < 1) {
            iRed = (m1+(m2-m1)*hf2*6);
        } else {
            if (2 * hf2 < 1) {
                iRed = m2;
            } else {
                if (3.0*hf2 < 2.0) {
                    iRed = (m1+(m2-m1)*((2.0/3.0)-hf2)*6.0);
                } else {
                    iRed = m1;
                }
            }
        }

        //Calculate Green
        if (iHue < 0) {iHue = iHue + 1.0;}
        if (iHue > 1) {iHue = iHue - 1.0;}
        if (6.0 * iHue < 1){
            iGreen = (m1+(m2-m1)*iHue*6.0);}
        else {
            if (2.0 * iHue < 1){
                iGreen = m2;
            } else {
                if (3.0*iHue < 2.0) {
                    iGreen = (m1+(m2-m1)*((2.0/3.0)-iHue)*6.0);
                } else {
                    iGreen = m1;
                }
            }
        }

        //Calculate Blue
        hf2=iHue-1.0/3.0;
        if (hf2 < 0) {hf2 = hf2 + 1.0;}
        if (hf2 > 1) {hf2 = hf2 - 1.0;}
        if (6.0 * hf2 < 1) {
            iBlue = (m1+(m2-m1)*hf2*6.0);
        } else {
            if (2.0 * hf2 < 1){
                iBlue = m2;
            } else {
                if (3.0*hf2 < 2.0) {
                    iBlue = (m1+(m2-m1)*((2.0/3.0)-hf2)*6.0);
                } else {
                    iBlue = m1;
                }
            }
        }

    }
    return [Math.round(iRed*255),Math.round(iGreen*255),Math.round(iBlue*255)];
}

EnergyFolks.prototype.AnchorPosition_getPageOffsetLeft = function(el) {
    var ol=el.offsetLeft;
    while ((el=el.offsetParent) != null) {ol += el.offsetLeft;}
    return ol;
}
EnergyFolks.prototype.AnchorPosition_getWindowOffsetLeft = function(el) {
    return this.AnchorPosition_getPageOffsetLeft(el)-document.body.scrollLeft;
}
EnergyFolks.prototype.AnchorPosition_getPageOffsetTop = function(el) {
    var ot=el.offsetTop;
    while((el=el.offsetParent) != null) {ot += el.offsetTop;}
    return ot;
}
EnergyFolks.prototype.AnchorPosition_getWindowOffsetTop = function(el) {
    return this.AnchorPosition_getPageOffsetTop(el)-document.body.scrollTop;
}
EnergyFolks.prototype.getAnchorPosition = function(anchorname) {
    // This function will return an Object with x and y properties
    var useWindow=false;
    var coordinates=new Object();
    var x=0,y=0;
    // Browser capability sniffing
    var use_gebi=false, use_css=false, use_layers=false;
    if (EnFolks_get_object) {use_gebi=true;}
    else if (document.all) {use_css=true;}
    else if (document.layers) {use_layers=true;}
    // Logic to find position
    if (use_gebi && document.all) {
        x=this.AnchorPosition_getPageOffsetLeft(document.all[anchorname]);
        y=this.AnchorPosition_getPageOffsetTop(document.all[anchorname]);
    }
    else if (use_gebi) {
        var o=EnFolks_get_object(anchorname);
        x=this.AnchorPosition_getPageOffsetLeft(o);
        y=this.AnchorPosition_getPageOffsetTop(o);
    }
    else if (use_css) {
        x=this.AnchorPosition_getPageOffsetLeft(document.all[anchorname]);
        y=this.AnchorPosition_getPageOffsetTop(document.all[anchorname]);
    }
    else if (use_layers) {
        var found=0;
        for (var i=0; i<document.anchors.length; i++) {
            if (document.anchors[i].name==anchorname) {found=1;break;}
        }
        if (found==0) {
            coordinates.x=0;coordinates.y=0;return coordinates;
        }
        x=document.anchors[i].x;
        y=document.anchors[i].y;
    }
    else {
        coordinates.x=0;coordinates.y=0;return coordinates;
    }
    if(EnFolks_get_object("wpadminbar"))
        y+=28;
    coordinates.x=x;
    coordinates.y=y;
    return coordinates;
}
EnergyFolks.prototype.strip_tags = function(input, allowed) {
    if(input == null) return "";
    allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
        commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
    return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
        return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
    });
}
//END PRIVATE FUNCTIONS
//Extra helper functions

function Enfolks_toggleit(id) {
    if(EnFolks_get_object('Enfolks_span' + id).style.display == 'none')
        Enfolks_uncollapse(id);
    else
        Enfolks_collapse(id);
}
function Enfolks_uncollapse(id) {
    EnFolks_get_object('Enfolks_span' + id).style.display='inline';
    EnFolks_get_object('Enfolks_spanimg' + id).src='https://images.energyfolks.com/images/downarrowb.png';
    EnFolks_get_object('Enfolks_spanlink' + id).style.textDecoration='none';
}
function Enfolks_collapse(id) {
    EnFolks_get_object('Enfolks_span' + id).style.display='none';
    EnFolks_get_object('Enfolks_spanimg' + id).src='https://images.energyfolks.com/images/rightarrowb.png';
    EnFolks_get_object('Enfolks_spanlink' + id).style.textDecoration='underline';
}
function EnFolks_get_object(id) {
    var object = null;
    if( document.layers )	{
        object = document.layers[id];
    } else if( EnFolks_get_object ) {
        object = document.getElementById(id);
    } else if( document.all ) {
        object = document.all[id];
    }
    return object;
}

//Mapping features...note: this requires the google MAPS API V3 to be loaded, and a div with id='map_div' to be present
var map = null;
function LoadBlankMap(alerted) {
    if(typeof google === 'undefined') {
        window.setTimeout(function() { LoadBlankMap();},1000);
        return;
    }
    var myOptions = {
        zoom: 8,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    map = new google.maps.Map(EnFolks_get_object("map_div"), myOptions);
}
function CenterMap(Lat,Long,text,admin) {
    if(typeof google === 'undefined') {
        window.setTimeout(function(l1,l2,l3,l4) { return function() { CenterMap(l1,l2,l3,l4);};}(Lat,Long,text,admin),1000);
        return;
    }
    var myLatlng = new google.maps.LatLng(Lat,Long);
    var myOptions = {
        zoom: 14,
        center: myLatlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    map = new google.maps.Map(EnFolks_get_object("map_div"), myOptions);
    var marker = new google.maps.Marker({position: myLatlng,map:map});
    marker.set('icon',new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=|"+EnFolks_Default_Color,null,null,new google.maps.Point(10,34)));
    marker.set('shadow',new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_shadow",null,null,new google.maps.Point(10,37)));
    if(admin) {
        marker.set("draggable",true);
        google.maps.event.addDomListener(marker,"dragend",DraggedLabel);
    }
}


function DecodeAddress(id,alerted) {
    if(typeof google === 'undefined') {
        if(alerted != 1) alert("The google maps library has not yet completed loading.  Please wait for the library to load.  A message will be displayed when the library finishes loading.");
        window.setTimeout(function(l1) { return function() { DecodeAddress(l1,1);};}(id),1000);
        return;
    }
    if(alerted == 1) alert("The google maps library has completed loading");
    if(EnFolks_get_object("map_error")) hide("map_error");
    if(EnFolks_get_object("map_loader")) show("map_loader");
    if(EnFolks_get_object('map_div_holder')) hide('map_div_holder');
    if(EnFolks_get_object('map_tr'))
        EnFolks_get_object('map_tr').style.display="";
    Gcoder= new google.maps.Geocoder();
    Gcoder.geocode({'address':EnFolks_get_object(id).value},function(point,status) {
        if(EnFolks_get_object('map_loader')) hide('map_loader');
        if (status == google.maps.GeocoderStatus.OK) {
            if(EnFolks_get_object('map_div_holder')) show('map_div_holder');
            var myOptions = {
                zoom: 14,
                center: point[0].geometry.location,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            }
            map = new google.maps.Map(EnFolks_get_object("map_div"), myOptions);
            var marker = new google.maps.Marker({position: point[0].geometry.location,map:map,draggable:true});
            marker.set('icon',new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=|"+EnFolks_Default_Color,null,null,new google.maps.Point(10,34)));
            marker.set('shadow',new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_shadow",null,null,new google.maps.Point(10,37)));
            google.maps.event.addDomListener(marker,"dragend",DraggedLabel);
            if(EnFolks_get_object('lat')) EnFolks_get_object('lat').value=point[0].geometry.location.lat();
            if(EnFolks_get_object('long')) EnFolks_get_object('long').value=point[0].geometry.location.lng();
        } else {
            if(EnFolks_get_object("map_error")) show("map_error");
            if(EnFolks_get_object('lat')) EnFolks_get_object('lat').value="";
            if(EnFolks_get_object('long')) EnFolks_get_object('long').value="";
        }
    });
}
function DraggedLabel(event) {
    var clickedLocation = event.latLng;
    if(EnFolks_get_object('lat')) EnFolks_get_object('lat').value=clickedLocation.lat();
    if(EnFolks_get_object('long')) EnFolks_get_object('long').value=clickedLocation.lng();
}
function EnFolks_setCookie(c_name,value) {
    var expiredays=900;
    var exdate=new Date()
    exdate.setDate(exdate.getDate()+expiredays)
    document.cookie=c_name+ "=" +escape(value)+
        ((expiredays==null) ? "" : ";expires="+exdate.toGMTString())
}

function EnFolks_getCookie(c_name) {
    if (document.cookie.length>0)
    {
        c_start=document.cookie.indexOf(c_name + "=")
        if (c_start!=-1)
        {
            c_start=c_start + c_name.length+1
            c_end=document.cookie.indexOf(";",c_start)
            if (c_end==-1) c_end=document.cookie.length
            return unescape(document.cookie.substring(c_start,c_end))
        }
    }
    return ""
}


//SLIDER BAR CODE:

//COMMON:
//v.2.6 build 100722

/*
 Copyright DHTMLX LTD. http://www.dhtmlx.com
 You allowed to use this component or parts of it under GPL terms
 To use it on other terms or get Professional edition of the component please contact us at sales@dhtmlx.com
 */
dhtmlx=function(obj){
    for (var a in obj) dhtmlx[a]=obj[a];
    return dhtmlx; //simple singleton
};
dhtmlx.extend_api=function(name,map,ext){
    var t = window[name];
    if (!t) return; //component not defined
    window[name]=function(obj){
        if (obj && typeof obj == "object" && !obj.tagName){
            var that = t.apply(this,(map._init?map._init(obj):arguments));
            //global settings
            for (var a in dhtmlx)
                if (map[a]) this[map[a]](dhtmlx[a]);
            //local settings
            for (var a in obj){
                if (map[a]) this[map[a]](obj[a]);
                else if (a.indexOf("on")==0){
                    this.attachEvent(a,obj[a]);
                }
            }
        } else
            var that = t.apply(this,arguments);
        if (map._patch) map._patch(this);
        return that||this;
    };
    window[name].prototype=t.prototype;
    if (ext)
        dhtmlXHeir(window[name].prototype,ext);
};

dhtmlxAjax={
    get:function(url,callback){
        var t=new dtmlXMLLoaderObject(true);
        t.async=(arguments.length<3);
        t.waitCall=callback;
        t.loadXML(url)
        return t;
    },
    post:function(url,post,callback){
        var t=new dtmlXMLLoaderObject(true);
        t.async=(arguments.length<4);
        t.waitCall=callback;
        t.loadXML(url,true,post)
        return t;
    },
    getSync:function(url){
        return this.get(url,null,true)
    },
    postSync:function(url,post){
        return this.post(url,post,null,true);
    }
}

/**
 *     @desc: xmlLoader object
 *     @type: private
 *     @param: funcObject - xml parser function
 *     @param: object - jsControl object
 *     @param: async - sync/async mode (async by default)
 *     @param: rSeed - enable/disable random seed ( prevent IE caching)
 *     @topic: 0
 */
function dtmlXMLLoaderObject(funcObject, dhtmlObject, async, rSeed){
    this.xmlDoc="";

    if (typeof (async) != "undefined")
        this.async=async;
    else
        this.async=true;

    this.onloadAction=funcObject||null;
    this.mainObject=dhtmlObject||null;
    this.waitCall=null;
    this.rSeed=rSeed||false;
    return this;
};
/**
 *     @desc: xml loading handler
 *     @type: private
 *     @param: dtmlObject - xmlLoader object
 *     @topic: 0
 */
dtmlXMLLoaderObject.prototype.waitLoadFunction=function(dhtmlObject){
    var once = true;
    this.check=function (){
        if ((dhtmlObject)&&(dhtmlObject.onloadAction != null)){
            if ((!dhtmlObject.xmlDoc.readyState)||(dhtmlObject.xmlDoc.readyState == 4)){
                if (!once)
                    return;

                once=false; //IE 5 fix
                if (typeof dhtmlObject.onloadAction == "function")
                    dhtmlObject.onloadAction(dhtmlObject.mainObject, null, null, null, dhtmlObject);

                if (dhtmlObject.waitCall){
                    dhtmlObject.waitCall.call(this,dhtmlObject);
                    dhtmlObject.waitCall=null;
                }
            }
        }
    };
    return this.check;
};

/**
 *     @desc: return XML top node
 *     @param: tagName - top XML node tag name (not used in IE, required for Safari and Mozilla)
 *     @type: private
 *     @returns: top XML node
 *     @topic: 0
 */
dtmlXMLLoaderObject.prototype.getXMLTopNode=function(tagName, oldObj){
    if (this.xmlDoc.responseXML){
        var temp = this.xmlDoc.responseXML.getElementsByTagName(tagName);
        if(temp.length==0 && tagName.indexOf(":")!=-1)
            var temp = this.xmlDoc.responseXML.getElementsByTagName((tagName.split(":"))[1]);
        var z = temp[0];
    } else
        var z = this.xmlDoc.documentElement;

    if (z){
        this._retry=false;
        return z;
    }

    if ((_isIE)&&(!this._retry)){
        //fall back to MS.XMLDOM
        var xmlString = this.xmlDoc.responseText;
        var oldObj = this.xmlDoc;
        this._retry=true;
        this.xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
        this.xmlDoc.async=false;
        this.xmlDoc["loadXM"+"L"](xmlString);

        return this.getXMLTopNode(tagName, oldObj);
    }
    dhtmlxError.throwError("LoadXML", "Incorrect XML", [
        (oldObj||this.xmlDoc),
        this.mainObject
    ]);

    return document.createElement("DIV");
};

/**
 *     @desc: load XML from string
 *     @type: private
 *     @param: xmlString - xml string
 *     @topic: 0
 */
dtmlXMLLoaderObject.prototype.loadXMLString=function(xmlString){
    {
        try{
            var parser = new DOMParser();
            this.xmlDoc=parser.parseFromString(xmlString, "text/xml");
        }
        catch (e){
            this.xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
            this.xmlDoc.async=this.async;
            this.xmlDoc["loadXM"+"L"](xmlString);
        }
    }

    this.onloadAction(this.mainObject, null, null, null, this);

    if (this.waitCall){
        this.waitCall();
        this.waitCall=null;
    }
}
/**
 *     @desc: load XML
 *     @type: private
 *     @param: filePath - xml file path
 *     @param: postMode - send POST request
 *     @param: postVars - list of vars for post request
 *     @topic: 0
 */
dtmlXMLLoaderObject.prototype.loadXML=function(filePath, postMode, postVars, rpc){
    if (this.rSeed)
        filePath+=((filePath.indexOf("?") != -1) ? "&" : "?")+"a_dhx_rSeed="+(new Date()).valueOf();
    this.filePath=filePath;

    if ((!_isIE)&&(window.XMLHttpRequest))
        this.xmlDoc=new XMLHttpRequest();
    else {
        if (document.implementation&&document.implementation.createDocument){
            this.xmlDoc=document.implementation.createDocument("", "", null);
            this.xmlDoc.onload=new this.waitLoadFunction(this);
            this.xmlDoc.load(filePath);
            return;
        } else
            this.xmlDoc=new ActiveXObject("Microsoft.XMLHTTP");
    }

    if (this.async)
        this.xmlDoc.onreadystatechange=new this.waitLoadFunction(this);
    this.xmlDoc.open(postMode ? "POST" : "GET", filePath, this.async);

    if (rpc){
        this.xmlDoc.setRequestHeader("User-Agent", "dhtmlxRPC v0.1 ("+navigator.userAgent+")");
        this.xmlDoc.setRequestHeader("Content-type", "text/xml");
    }

    else if (postMode)
        this.xmlDoc.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    this.xmlDoc.setRequestHeader("X-Requested-With","XMLHttpRequest");
    this.xmlDoc.send(null||postVars);

    if (!this.async)
        (new this.waitLoadFunction(this))();
};
/**
 *     @desc: destructor, cleans used memory
 *     @type: private
 *     @topic: 0
 */
dtmlXMLLoaderObject.prototype.destructor=function(){
    this._filterXPath = null;
    this._getAllNamedChilds = null;
    this._retry = null;
    this.async = null;
    this.rSeed = null;
    this.filePath = null;
    this.onloadAction = null;
    this.mainObject = null;
    this.xmlDoc = null;
    this.doXPath = null;
    this.doXPathOpera = null;
    this.doXSLTransToObject = null;
    this.doXSLTransToString = null;
    this.loadXML = null;
    this.loadXMLString = null;
    // this.waitLoadFunction = null;
    this.doSerialization = null;
    this.xmlNodeToJSON = null;
    this.getXMLTopNode = null;
    this.setXSLParamValue = null;
    return null;
}

dtmlXMLLoaderObject.prototype.xmlNodeToJSON = function(node){
    var t={};
    for (var i=0; i<node.attributes.length; i++)
        t[node.attributes[i].name]=node.attributes[i].value;
    t["_tagvalue"]=node.firstChild?node.firstChild.nodeValue:"";
    for (var i=0; i<node.childNodes.length; i++){
        var name=node.childNodes[i].tagName;
        if (name){
            if (!t[name]) t[name]=[];
            t[name].push(this.xmlNodeToJSON(node.childNodes[i]));
        }
    }
    return t;
}

/**
 *     @desc: Call wrapper
 *     @type: private
 *     @param: funcObject - action handler
 *     @param: dhtmlObject - user data
 *     @returns: function handler
 *     @topic: 0
 */
function callerFunction(funcObject, dhtmlObject){
    this.handler=function(e){
        if (!e)
            e=window.event;
        funcObject(e, dhtmlObject);
        return true;
    };
    return this.handler;
};

/**
 *     @desc: Calculate absolute position of html object
 *     @type: private
 *     @param: htmlObject - html object
 *     @topic: 0
 */
function getAbsoluteLeft(htmlObject){
    return getOffset(htmlObject).left;
}
/**
 *     @desc: Calculate absolute position of html object
 *     @type: private
 *     @param: htmlObject - html object
 *     @topic: 0
 */
function getAbsoluteTop(htmlObject){
    return getOffset(htmlObject).top;
}

function getOffsetSum(elem) {
    var top=0, left=0;
    while(elem) {
        top = top + parseInt(elem.offsetTop);
        left = left + parseInt(elem.offsetLeft);
        elem = elem.offsetParent;
    }
    return {top: top, left: left};
}
function getOffsetRect(elem) {
    var box = elem.getBoundingClientRect();
    var body = document.body;
    var docElem = document.documentElement;
    var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
    var clientTop = docElem.clientTop || body.clientTop || 0;
    var clientLeft = docElem.clientLeft || body.clientLeft || 0;
    var top  = box.top +  scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;
    return {top: Math.round(top), left: Math.round(left)};
}
function getOffset(elem) {
    if (elem.getBoundingClientRect) {
        return getOffsetRect(elem);
    } else {
        return getOffsetSum(elem);
    }
}

/**
 *     @desc: Convert string to it boolean representation
 *     @type: private
 *     @param: inputString - string for covertion
 *     @topic: 0
 */
function convertStringToBoolean(inputString){
    if (typeof (inputString) == "string")
        inputString=inputString.toLowerCase();

    switch (inputString){
        case "1":
        case "true":
        case "yes":
        case "y":
        case 1:
        case true:
            return true;
            break;

        default:return false;
    }
}

/**
 *     @desc: find out what symbol to use as url param delimiters in further params
 *     @type: private
 *     @param: str - current url string
 *     @topic: 0
 */
function getUrlSymbol(str){
    if (str.indexOf("?") != -1)
        return "&"
    else
        return "?"
}

function dhtmlDragAndDropObject(){
    if (window.dhtmlDragAndDrop)
        return window.dhtmlDragAndDrop;

    this.lastLanding=0;
    this.dragNode=0;
    this.dragStartNode=0;
    this.dragStartObject=0;
    this.tempDOMU=null;
    this.tempDOMM=null;
    this.waitDrag=0;
    window.dhtmlDragAndDrop=this;

    return this;
};

dhtmlDragAndDropObject.prototype.removeDraggableItem=function(htmlNode){
    htmlNode.onmousedown=null;
    htmlNode.dragStarter=null;
    htmlNode.dragLanding=null;
}
dhtmlDragAndDropObject.prototype.addDraggableItem=function(htmlNode, dhtmlObject){
    htmlNode.onmousedown=this.preCreateDragCopy;
    htmlNode.dragStarter=dhtmlObject;
    this.addDragLanding(htmlNode, dhtmlObject);
}
dhtmlDragAndDropObject.prototype.addDragLanding=function(htmlNode, dhtmlObject){
    htmlNode.dragLanding=dhtmlObject;
}
dhtmlDragAndDropObject.prototype.preCreateDragCopy=function(e){
    if ((e||window.event) && (e||event).button == 2)
        return;

    if (window.dhtmlDragAndDrop.waitDrag){
        window.dhtmlDragAndDrop.waitDrag=0;
        document.body.onmouseup=window.dhtmlDragAndDrop.tempDOMU;
        document.body.onmousemove=window.dhtmlDragAndDrop.tempDOMM;
        return false;
    }

    window.dhtmlDragAndDrop.waitDrag=1;
    window.dhtmlDragAndDrop.tempDOMU=document.body.onmouseup;
    window.dhtmlDragAndDrop.tempDOMM=document.body.onmousemove;
    window.dhtmlDragAndDrop.dragStartNode=this;
    window.dhtmlDragAndDrop.dragStartObject=this.dragStarter;
    document.body.onmouseup=window.dhtmlDragAndDrop.preCreateDragCopy;
    document.body.onmousemove=window.dhtmlDragAndDrop.callDrag;
    window.dhtmlDragAndDrop.downtime = new Date().valueOf();


    if ((e)&&(e.preventDefault)){
        e.preventDefault();
        return false;
    }
    return false;
};
dhtmlDragAndDropObject.prototype.callDrag=function(e){
    if (!e)
        e=window.event;
    dragger=window.dhtmlDragAndDrop;
    if ((new Date()).valueOf()-dragger.downtime<100) return;

    if ((e.button == 0)&&(_isIE))
        return dragger.stopDrag();

    if (!dragger.dragNode&&dragger.waitDrag){
        dragger.dragNode=dragger.dragStartObject._createDragNode(dragger.dragStartNode, e);

        if (!dragger.dragNode)
            return dragger.stopDrag();

        dragger.dragNode.onselectstart=function(){return false;}
        dragger.gldragNode=dragger.dragNode;
        document.body.appendChild(dragger.dragNode);
        document.body.onmouseup=dragger.stopDrag;
        dragger.waitDrag=0;
        dragger.dragNode.pWindow=window;
        dragger.initFrameRoute();
    }

    if (dragger.dragNode.parentNode != window.document.body){
        var grd = dragger.gldragNode;

        if (dragger.gldragNode.old)
            grd=dragger.gldragNode.old;

        //if (!document.all) dragger.calculateFramePosition();
        grd.parentNode.removeChild(grd);
        var oldBody = dragger.dragNode.pWindow;

        if (grd.pWindow &&	grd.pWindow.dhtmlDragAndDrop.lastLanding)
            grd.pWindow.dhtmlDragAndDrop.lastLanding.dragLanding._dragOut(grd.pWindow.dhtmlDragAndDrop.lastLanding);

        //		var oldp=dragger.dragNode.parentObject;
        if (_isIE){
            var div = document.createElement("Div");
            div.innerHTML=dragger.dragNode.outerHTML;
            dragger.dragNode=div.childNodes[0];
        } else
            dragger.dragNode=dragger.dragNode.cloneNode(true);

        dragger.dragNode.pWindow=window;
        //		dragger.dragNode.parentObject=oldp;

        dragger.gldragNode.old=dragger.dragNode;
        document.body.appendChild(dragger.dragNode);
        oldBody.dhtmlDragAndDrop.dragNode=dragger.dragNode;
    }

    dragger.dragNode.style.left=e.clientX+15+(dragger.fx
        ? dragger.fx*(-1)
        : 0)
        +(document.body.scrollLeft||document.documentElement.scrollLeft)+"px";
    dragger.dragNode.style.top=e.clientY+3+(dragger.fy
        ? dragger.fy*(-1)
        : 0)
        +(document.body.scrollTop||document.documentElement.scrollTop)+"px";

    if (!e.srcElement)
        var z = e.target;
    else
        z=e.srcElement;
    dragger.checkLanding(z, e);
}

dhtmlDragAndDropObject.prototype.calculateFramePosition=function(n){
    //this.fx = 0, this.fy = 0;
    if (window.name){
        var el = parent.frames[window.name].frameElement.offsetParent;
        var fx = 0;
        var fy = 0;

        while (el){
            fx+=el.offsetLeft;
            fy+=el.offsetTop;
            el=el.offsetParent;
        }

        if ((parent.dhtmlDragAndDrop)){
            var ls = parent.dhtmlDragAndDrop.calculateFramePosition(1);
            fx+=ls.split('_')[0]*1;
            fy+=ls.split('_')[1]*1;
        }

        if (n)
            return fx+"_"+fy;
        else
            this.fx=fx;
        this.fy=fy;
    }
    return "0_0";
}
dhtmlDragAndDropObject.prototype.checkLanding=function(htmlObject, e){
    if ((htmlObject)&&(htmlObject.dragLanding)){
        if (this.lastLanding)
            this.lastLanding.dragLanding._dragOut(this.lastLanding);
        this.lastLanding=htmlObject;
        this.lastLanding=this.lastLanding.dragLanding._dragIn(this.lastLanding, this.dragStartNode, e.clientX,
            e.clientY, e);
        this.lastLanding_scr=(_isIE ? e.srcElement : e.target);
    } else {
        if ((htmlObject)&&(htmlObject.tagName != "BODY"))
            this.checkLanding(htmlObject.parentNode, e);
        else {
            if (this.lastLanding)
                this.lastLanding.dragLanding._dragOut(this.lastLanding, e.clientX, e.clientY, e);
            this.lastLanding=0;

            if (this._onNotFound)
                this._onNotFound();
        }
    }
}
dhtmlDragAndDropObject.prototype.stopDrag=function(e, mode){
    dragger=window.dhtmlDragAndDrop;

    if (!mode){
        dragger.stopFrameRoute();
        var temp = dragger.lastLanding;
        dragger.lastLanding=null;

        if (temp)
            temp.dragLanding._drag(dragger.dragStartNode, dragger.dragStartObject, temp, (_isIE
                ? event.srcElement
                : e.target));
    }
    dragger.lastLanding=null;

    if ((dragger.dragNode)&&(dragger.dragNode.parentNode == document.body))
        dragger.dragNode.parentNode.removeChild(dragger.dragNode);
    dragger.dragNode=0;
    dragger.gldragNode=0;
    dragger.fx=0;
    dragger.fy=0;
    dragger.dragStartNode=0;
    dragger.dragStartObject=0;
    document.body.onmouseup=dragger.tempDOMU;
    document.body.onmousemove=dragger.tempDOMM;
    dragger.tempDOMU=null;
    dragger.tempDOMM=null;
    dragger.waitDrag=0;
}

dhtmlDragAndDropObject.prototype.stopFrameRoute=function(win){
    if (win)
        window.dhtmlDragAndDrop.stopDrag(1, 1);

    for (var i = 0; i < window.frames.length; i++){
        try{
            if ((window.frames[i] != win)&&(window.frames[i].dhtmlDragAndDrop))
                window.frames[i].dhtmlDragAndDrop.stopFrameRoute(window);
        } catch(e){}
    }

    try{
        if ((parent.dhtmlDragAndDrop)&&(parent != window)&&(parent != win))
            parent.dhtmlDragAndDrop.stopFrameRoute(window);
    } catch(e){}
}
dhtmlDragAndDropObject.prototype.initFrameRoute=function(win, mode){
    if (win){
        window.dhtmlDragAndDrop.preCreateDragCopy();
        window.dhtmlDragAndDrop.dragStartNode=win.dhtmlDragAndDrop.dragStartNode;
        window.dhtmlDragAndDrop.dragStartObject=win.dhtmlDragAndDrop.dragStartObject;
        window.dhtmlDragAndDrop.dragNode=win.dhtmlDragAndDrop.dragNode;
        window.dhtmlDragAndDrop.gldragNode=win.dhtmlDragAndDrop.dragNode;
        window.document.body.onmouseup=window.dhtmlDragAndDrop.stopDrag;
        window.waitDrag=0;

        if (((!_isIE)&&(mode))&&((!_isFF)||(_FFrv < 1.8)))
            window.dhtmlDragAndDrop.calculateFramePosition();
    }
    try{
        if ((parent.dhtmlDragAndDrop)&&(parent != window)&&(parent != win))
            parent.dhtmlDragAndDrop.initFrameRoute(window);
    }catch(e){}

    for (var i = 0; i < window.frames.length; i++){
        try{
            if ((window.frames[i] != win)&&(window.frames[i].dhtmlDragAndDrop))
                window.frames[i].dhtmlDragAndDrop.initFrameRoute(window, ((!win||mode) ? 1 : 0));
        } catch(e){}
    }
}

var _isFF = false;
var _isIE = false;
var _isOpera = false;
var _isKHTML = false;
var _isMacOS = false;
var _isChrome = false;

if (navigator.userAgent.indexOf('Macintosh') != -1)
    _isMacOS=true;


if (navigator.userAgent.toLowerCase().indexOf('chrome')>-1)
    _isChrome=true;

if ((navigator.userAgent.indexOf('Safari') != -1)||(navigator.userAgent.indexOf('Konqueror') != -1)){
    var _KHTMLrv = parseFloat(navigator.userAgent.substr(navigator.userAgent.indexOf('Safari')+7, 5));

    if (_KHTMLrv > 525){ //mimic FF behavior for Safari 3.1+
        _isFF=true;
        var _FFrv = 1.9;
    } else
        _isKHTML=true;
} else if (navigator.userAgent.indexOf('Opera') != -1){
    _isOpera=true;
    _OperaRv=parseFloat(navigator.userAgent.substr(navigator.userAgent.indexOf('Opera')+6, 3));
}


else if (navigator.appName.indexOf("Microsoft") != -1){
    _isIE=true;
    if (navigator.appVersion.indexOf("MSIE 8.0")!= -1 && document.compatMode != "BackCompat") _isIE=8;
} else {
    _isFF=true;
    var _FFrv = parseFloat(navigator.userAgent.split("rv:")[1])
}


//multibrowser Xpath processor
dtmlXMLLoaderObject.prototype.doXPath=function(xpathExp, docObj, namespace, result_type){
    if (_isKHTML || (!_isIE && !window.XPathResult))
        return this.doXPathOpera(xpathExp, docObj);

    if (_isIE){ //IE
        if (!docObj)
            if (!this.xmlDoc.nodeName)
                docObj=this.xmlDoc.responseXML
            else
                docObj=this.xmlDoc;

        if (!docObj)
            dhtmlxError.throwError("LoadXML", "Incorrect XML", [
                (docObj||this.xmlDoc),
                this.mainObject
            ]);

        if (namespace != null)
            docObj.setProperty("SelectionNamespaces", "xmlns:xsl='"+namespace+"'"); //

        if (result_type == 'single'){
            return docObj.selectSingleNode(xpathExp);
        }
        else {
            return docObj.selectNodes(xpathExp)||new Array(0);
        }
    } else { //Mozilla
        var nodeObj = docObj;

        if (!docObj){
            if (!this.xmlDoc.nodeName){
                docObj=this.xmlDoc.responseXML
            }
            else {
                docObj=this.xmlDoc;
            }
        }

        if (!docObj)
            dhtmlxError.throwError("LoadXML", "Incorrect XML", [
                (docObj||this.xmlDoc),
                this.mainObject
            ]);

        if (docObj.nodeName.indexOf("document") != -1){
            nodeObj=docObj;
        }
        else {
            nodeObj=docObj;
            docObj=docObj.ownerDocument;
        }
        var retType = XPathResult.ANY_TYPE;

        if (result_type == 'single')
            retType=XPathResult.FIRST_ORDERED_NODE_TYPE
        var rowsCol = new Array();
        var col = docObj.evaluate(xpathExp, nodeObj, function(pref){
            return namespace
        }, retType, null);

        if (retType == XPathResult.FIRST_ORDERED_NODE_TYPE){
            return col.singleNodeValue;
        }
        var thisColMemb = col.iterateNext();

        while (thisColMemb){
            rowsCol[rowsCol.length]=thisColMemb;
            thisColMemb=col.iterateNext();
        }
        return rowsCol;
    }
}

function _dhtmlxError(type, name, params){
    if (!this.catches)
        this.catches=new Array();

    return this;
}

_dhtmlxError.prototype.catchError=function(type, func_name){
    this.catches[type]=func_name;
}
_dhtmlxError.prototype.throwError=function(type, name, params){
    if (this.catches[type])
        return this.catches[type](type, name, params);

    if (this.catches["ALL"])
        return this.catches["ALL"](type, name, params);

    alert("Error type: "+arguments[0]+"\nDescription: "+arguments[1]);
    return null;
}

window.dhtmlxError=new _dhtmlxError();


//opera fake, while 9.0 not released
//multibrowser Xpath processor
dtmlXMLLoaderObject.prototype.doXPathOpera=function(xpathExp, docObj){
    //this is fake for Opera
    var z = xpathExp.replace(/[\/]+/gi, "/").split('/');
    var obj = null;
    var i = 1;

    if (!z.length)
        return [];

    if (z[0] == ".")
        obj=[docObj];else if (z[0] == ""){
        obj=(this.xmlDoc.responseXML||this.xmlDoc).getElementsByTagName(z[i].replace(/\[[^\]]*\]/g, ""));
        i++;
    } else
        return [];

    for (i; i < z.length; i++)obj=this._getAllNamedChilds(obj, z[i]);

    if (z[i-1].indexOf("[") != -1)
        obj=this._filterXPath(obj, z[i-1]);
    return obj;
}

dtmlXMLLoaderObject.prototype._filterXPath=function(a, b){
    var c = new Array();
    var b = b.replace(/[^\[]*\[\@/g, "").replace(/[\[\]\@]*/g, "");

    for (var i = 0; i < a.length; i++)
        if (a[i].getAttribute(b))
            c[c.length]=a[i];

    return c;
}
dtmlXMLLoaderObject.prototype._getAllNamedChilds=function(a, b){
    var c = new Array();

    if (_isKHTML)
        b=b.toUpperCase();

    for (var i = 0; i < a.length; i++)for (var j = 0; j < a[i].childNodes.length; j++){
        if (_isKHTML){
            if (a[i].childNodes[j].tagName&&a[i].childNodes[j].tagName.toUpperCase() == b)
                c[c.length]=a[i].childNodes[j];
        }

        else if (a[i].childNodes[j].tagName == b)
            c[c.length]=a[i].childNodes[j];
    }

    return c;
}

function dhtmlXHeir(a, b){
    for (var c in b)
        if (typeof (b[c]) == "function")
            a[c]=b[c];
    return a;
}

function dhtmlxEvent(el, event, handler){
    if (el.addEventListener)
        el.addEventListener(event, handler, false);

    else if (el.attachEvent)
        el.attachEvent("on"+event, handler);
}

//============= XSL Extension ===================================

dtmlXMLLoaderObject.prototype.xslDoc=null;
dtmlXMLLoaderObject.prototype.setXSLParamValue=function(paramName, paramValue, xslDoc){
    if (!xslDoc)
        xslDoc=this.xslDoc

    if (xslDoc.responseXML)
        xslDoc=xslDoc.responseXML;
    var item =
        this.doXPath("/xsl:stylesheet/xsl:variable[@name='"+paramName+"']", xslDoc,
            "http:/\/www.w3.org/1999/XSL/Transform", "single");

    if (item != null)
        item.firstChild.nodeValue=paramValue
}
dtmlXMLLoaderObject.prototype.doXSLTransToObject=function(xslDoc, xmlDoc){
    if (!xslDoc)
        xslDoc=this.xslDoc;

    if (xslDoc.responseXML)
        xslDoc=xslDoc.responseXML

    if (!xmlDoc)
        xmlDoc=this.xmlDoc;

    if (xmlDoc.responseXML)
        xmlDoc=xmlDoc.responseXML

    //MOzilla
    if (!_isIE){
        if (!this.XSLProcessor){
            this.XSLProcessor=new XSLTProcessor();
            this.XSLProcessor.importStylesheet(xslDoc);
        }
        var result = this.XSLProcessor.transformToDocument(xmlDoc);
    } else {
        var result = new ActiveXObject("Msxml2.DOMDocument.3.0");
        try{
            xmlDoc.transformNodeToObject(xslDoc, result);
        }catch(e){
            result = xmlDoc.transformNode(xslDoc);
        }
    }
    return result;
}

dtmlXMLLoaderObject.prototype.doXSLTransToString=function(xslDoc, xmlDoc){
    var res = this.doXSLTransToObject(xslDoc, xmlDoc);
    if(typeof(res)=="string")
        return res;
    return this.doSerialization(res);
}

dtmlXMLLoaderObject.prototype.doSerialization=function(xmlDoc){
    if (!xmlDoc)
        xmlDoc=this.xmlDoc;
    if (xmlDoc.responseXML)
        xmlDoc=xmlDoc.responseXML
    if (!_isIE){
        var xmlSerializer = new XMLSerializer();
        return xmlSerializer.serializeToString(xmlDoc);
    } else
        return xmlDoc.xml;
}

/**
 *   @desc:
 *   @type: private
 */
dhtmlxEventable=function(obj){
    obj.attachEvent=function(name, catcher, callObj){
        name='ev_'+name.toLowerCase();
        if (!this[name])
            this[name]=new this.eventCatcher(callObj||this);

        return(name+':'+this[name].addEvent(catcher)); //return ID (event name & event ID)
    }
    obj.callEvent=function(name, arg0){
        name='ev_'+name.toLowerCase();
        if (this[name])
            return this[name].apply(this, arg0);
        return true;
    }
    obj.checkEvent=function(name){
        return (!!this['ev_'+name.toLowerCase()])
    }
    obj.eventCatcher=function(obj){
        var dhx_catch = [];
        var z = function(){
            var res = true;
            for (var i = 0; i < dhx_catch.length; i++){
                if (dhx_catch[i] != null){
                    var zr = dhx_catch[i].apply(obj, arguments);
                    res=res&&zr;
                }
            }
            return res;
        }
        z.addEvent=function(ev){
            if (typeof (ev) != "function")
                ev=eval(ev);
            if (ev)
                return dhx_catch.push(ev)-1;
            return false;
        }
        z.removeEvent=function(id){
            dhx_catch[id]=null;
        }
        return z;
    }
    obj.detachEvent=function(id){
        if (id != false){
            var list = id.split(':');           //get EventName and ID
            this[list[0]].removeEvent(list[1]); //remove event
        }
    }
    obj.detachAllEvents = function(){
        for (var name in this){
            if (name.indexOf("ev_")==0)
                delete this[name];
        }
    }
}


//v.2.6 build 100722

/*
 Copyright DHTMLX LTD. http://www.dhtmlx.com
 You allowed to use this component or parts of it under GPL terms
 To use it on other terms or get Professional edition of the component please contact us at sales@dhtmlx.com
 */
/*
 Copyright DHTMLX LTD. http://www.dhtmlx.com
 To use this component please contact sales@dhtmlx.com to obtain license
 */

/*_TOPICS_
 @0:initialization
 @1:overal control
 */

/**
 *   @desc: dhtmlxSlider constructor
 *   @param: base - (string|object) id of parent element, or parent element object, or object with properties, or null for inline generation
 *   @param: size - (integer) size of slider
 *   @param: skin - (string|object) skin name
 *   @param: vertical - (boolean) flag of vertical orientation
 *   @param: min - (int) minimum value
 *   @param: max - (int) maximum value
 *   @param: value - (int) initial value
 *   @param: step - (int) step of measurement
 *   @returns: dhtmlxSlider object
 *   @type: public
 */
function dhtmlxSlider(base,size,min,max,value,value2,inid,step){
    if (_isIE) try {document.execCommand("BackgroundImageCache", false, true);} catch (e){}
    var parentNod;
    if (base && typeof(base)=="object" && !base.nodeName){
        parentNod=base.parent;
        skin=base.skin;
        min=base.min;
        max=base.max
        step=base.step
        vertical=base.vertical
        value=base.value;
        size=base.size;
    }
    this.slideid=inid;
    if (!base){
        var z="slider_div_"+(new Date()).valueOf()+Math.random(1000);
        parentNod = document.createElement ("div");
        parentNod.setAttribute ("id", z);

        var child = document.body.lastChild;
        while (child.lastChild && child.lastChild.nodeType == 1) child=child.lastChild;
        child.parentNode.insertBefore(parentNod,child);
    }
    else if (typeof(base)!="object")
        parentNod=document.getElementById(base);
    else
        parentNod = base;

    if (typeof(size)=="object"){
        skin=size.skin;
        min=size.min;
        max=size.max
        step=size.step
        vertical=size.vertical
        value=size.value;
        size=size.size;
    }

    this.size = size;
    this.vMode=false;
    this.skin = "dhx_skyblue";
    this.parent = parentNod;
    this.isInit = false;
    this.disabled = false;

    this.value = value || min || 0;
    this.value2 = value2 || max || 1;
    this.inputPriority = true;
    this.stepping = false;

    this.imgURL = window.dhx_globalImgPath||dhtmlx.image_path||"";
    this._skinsImgs =
    {
        "default":    {ls:1,lz:1,rz:1,rs:1},
        ball:        {ls:1,lz:1,rz:1,rs:1},
        zipper:      {bg:1,lz:1,rz:1},
        arrow:       {bg:1,ls:1,rs:1},
        arrowgreen:  {bg:1,ls:1,rs:1},
        simplesilver:{lz:1,ls:1,rs:1,rz:1},
        simplegray:  {lz:1,ls:1,rs:1,rz:1},
        bar:         {bg:1,ls:1,rs:1},
        dhx_skyblue: {bg:1,ls:1,rs:1}
    };

    this._def = [min-0||0,max-0||100,step-0||1,value-0||0,size-0,value2];

    dhtmlxEventable(this);

    return this;
}

/**
 *  @desc:  create structure of slider
 *  @type: private
 *  @topic: 0
 */
dhtmlxSlider.prototype.createStructure = function(){
    if (this.con) {
        this.con.parentNode.removeChild(this.con);
        this.con = null;
    }

    if (this.vMode) {
        this._sW="height";this._sH="width";this._sL="top";this._sT="left";
        var skinImgPath = this.imgURL+"skins/"+this.skin+"/vertical/";
    } else {
        this._sW="width";this._sH="height";this._sL="left";this._sT="top";
        var skinImgPath = "https://images.energyfolks.com/images/slider/";
    }

    this.con=document.createElement("DIV");
    this.con.onselectstart=function(){return false;};
    this.con._etype="slider";
    this.con.style.position='relative';
    this.con.style.overflow='hidden';
    this.con.style.height='15px';
    this.con.style.left='10px';
    if (this._skinsImgs[this.skin]['bg'])
        this.con.style.backgroundImage = "url("+skinImgPath+"bg.gif)";

    this.drag=document.createElement("DIV");
    this.drag._etype="drag";
    this.drag.style.position='absolute';
    this.drag.style.overflow='hidden';
    this.drag.style.height='15px';
    this.drag.style.width='15px';
    this.drag.style.left='0px';
    this.drag.style.cursor='pointer';
    this.drag.style.backgroundImage = "url("+skinImgPath+"selector.gif)";
    this.drag2=document.createElement("DIV");
    this.drag2._etype="drag2";
    this.drag2.style.position='absolute';
    this.drag2.style.overflow='hidden';
    this.drag2.style.height='15px';
    this.drag2.style.width='15px';
    this.drag2.style.left='0px';
    this.drag2.style.cursor='pointer';
    this.drag2.style.backgroundImage = "url("+skinImgPath+"selector.gif)";

    var leftSide = document.createElement("DIV");
    leftSide.style.position='absolute';
    leftSide.style.left='0px';
    leftSide.style.top='0px';
    leftSide.style.width='0px';
    leftSide.style.height='100%';
    this.leftZone = document.createElement("DIV");
    if (this._skinsImgs[this.skin]['lz'])
        this.leftZone.style.background = "url("+skinImgPath+"leftzone_bg.gif)";
    this.leftZone.style.width = this.value + 'px';
    this.leftZone.style.position='absolute';
    this.leftZone.style.left='0px';
    this.leftZone.style.top='0px';
    this.leftZone.style.height='100%';

    var rightSide = document.createElement("DIV");
    rightSide.style.position='absolute';
    rightSide.style.right='0px';
    rightSide.style.top='0px';
    rightSide.style.width='0px';
    rightSide.style.height='100%';

    this.rightZone = document.createElement("DIV");
    if (this._skinsImgs[this.skin]['rz'])
        this.rightZone.style.background = "url("+skinImgPath+"rightzone_bg.gif)";
    this.rightZone.style.position='absolute';
    this.rightZone.style.left='3px';
    this.rightZone.style.top='0px';
    this.rightZone.style.height='100%';

    this.con.appendChild(leftSide);
    this.con.appendChild(this.leftZone);
    this.con.appendChild(this.rightZone);
    this.con.appendChild(rightSide);
    this.con.appendChild(this.drag);
    this.con.appendChild(this.drag2);

    this.parent.appendChild(this.con);
    if (!this.parent.parentNode || !this.parent.parentNode.tagName)
        document.body.appendChild(this.parent);

    if (this.vMode) {
        this._sW="height";this._sH="width";this._sL="top";this._sT="left";

        this.con.style.width = this.con.offsetHeight + 'px';

        for (var i=0; i<this.con.childNodes.length; i++) {
            this.con.childNodes[i].style.fontSize = "0";
            var	tmp = this.con.childNodes[i].offsetWidth;
            this.con.childNodes[i].style.width = this.con.childNodes[i].offsetHeight + 'px';
            this.con.childNodes[i].style.height = tmp + 'px';
            tmp = this.con.childNodes[i].offsetLeft;
            this.con.childNodes[i].style.left = this.con.childNodes[i].offsetTop + 'px';
            this.con.childNodes[i].style.top = tmp + 'px';
        }

        rightSide.style.top	= this.size - rightSide.offsetHeight + 'px';

        this.zoneSize = this.size - rightSide.offsetHeight;
        this.dragLeft = this.drag.offsetTop;
        this.drag2Left = this.drag2.offsetTop;
        this.dragWidth = this.drag.offsetHeight;
        this.rightZone.style.height = this.zoneSize + 'px';

    } else {
        this.zoneSize = this.size - rightSide.offsetWidth;
        this.dragLeft = this.drag.offsetLeft;
        this.drag2Left = this.drag2.offsetLeft;
        this.dragWidth = 15;
        this.rightZone.style.width = this.zoneSize + 'px';
    }

    this.con.style[this._sW] = this.size+"px";
    this.con.onmousedown=this._onMouseDown;
    this.con.onmouseup = this.con.onmouseout = function () {clearInterval (this.that._int)}

    this.con.that = this;
    this._aCalc(this._def);
}
/**
 *   @desc: calculates inner settings
 *   @type: private
 */
dhtmlxSlider.prototype._aCalc=function(def){//[min,max,step,value,size,value2]
    if (!this.isInit) return;
    this.shift=def[0];
    this.limit=def[1]-this.shift;
    this._mod=(def[4]-this.dragLeft*2-this.dragWidth)/this.limit;
    this._step=def[2];
    this.step=this._step*this._mod;
    this._xlimit=def[4]-this.dragLeft*2-this.dragWidth;
    this._xlimit2=def[4]-this.drag2Left*2-this.dragWidth;
    if (!this.posX){
        this.posX=this._xlimit*(def[3]-this.shift)/this.limit;
    }
    if (!this.posX2){
        this.posX2=this._xlimit2*(def[5]-this.shift)/this.limit;
    }
    this._applyPos(true);
    return this;
}

/**
 *   @desc: set new FROM value
 *   @param: val - (integer) set new From value
 *   @returns: dhtmlxSlider object
 *   @type: public
 */
dhtmlxSlider.prototype.setMin=function(val){
    this._def[0] = val-0;
    this._aCalc(this._def);
}
/**
 *   @desc: set new TO value
 *   @param: val - (integer) set new To value
 *   @returns: dhtmlxSlider object
 *   @type: public
 */
dhtmlxSlider.prototype.setMax=function(val){
    this._def[1] = val-0;
    this._aCalc(this._def);
}

/**
 *   @desc: set new "ST value
 *   @param: val - (integer) set new Step value
 *   @returns: dhtmlxSlider object
 *   @type: public
 */
dhtmlxSlider.prototype.setStep=function(val){
    this._def[2] = val-0;
    this._aCalc(this._def);
}

/**
 *   @desc: calculate real slider position and adjust display
 *   @type: private
 */
dhtmlxSlider.prototype._applyPos=function(skip){
    if (!this.isInit) return;
    if (this.step!=1)
        this.posX=Math.round(this.posX/this.step)*this.step;
    if (this.posX<0)
        this.posX=0;
    if (this.posX2<0)
        this.posX2=0;
    if (this.value < (this._def[0] || 0))
        this.value = this._def[0] || 0;
    //if (this.value < this._def[3])
    //this.value = this._def[3];
    if (this.value > this._def[1])
        this.value = this._def[1];
    if (this.posX>this._xlimit)
        this.posX=this._xlimit;
    if (this.posX2>this._xlimit2)
        this.posX2=this._xlimit2;
    if(this.posX > this.posX2) this.posX=this.posX2;
    var a_old=this.drag.style[this._sL];
    this.drag.style[this._sL]=this.posX+this.dragLeft*1+"px";
    this.drag2.style[this._sL]=this.posX2+this.drag2Left*1+"px";
    this.leftZone.style[this._sW]=this.posX+this.dragLeft*1+"px";
    this.rightZone.style[this._sL]=this.posX+this.dragLeft*1+1+"px";
    this.rightZone.style[this._sW]=this.zoneSize-(this.posX+this.dragLeft*1)+"px";

    var nw=this.getValue();
    var nw2=this.getValue2();
    EnFolks_get_object(this.slideid+"Left").innerHTML=nw;
    EnFolks_get_object(this.slideid+"Right").innerHTML=nw2;
    EnFolks_get_object(this.slideid+"Leftinput").value=nw;
    EnFolks_get_object(this.slideid+"Rightinput").value=nw2;
    if (this._link){
        if (this._linkBoth)
            this._link.value=nw;
        else
            this._link.innerHTML=nw;
    }
    if (!skip&&a_old!=this.drag.style[this._sL])
        this.callEvent("onChange",[nw,this]);
    this.value = this.getValue ();
    if(!this._dttp) this._setTooltip(nw);
}

/**
 *   @desc: set tooltip for all sub elements
 *   @type: private
 */
dhtmlxSlider.prototype._setTooltip=function(nw){
    this.con.title=nw;
}

/**
 *	@desc: set skin
 *	@tyoe: public
 *	@topic: 1
 */
dhtmlxSlider.prototype.setSkin=function(skin) {
    this.skin = skin||"default";
    if (this.isInit)
        this.createStructure();
}

/**
 *   @desc: start slider drag
 *   @type: private
 */
dhtmlxSlider.prototype.startDrag = function(e) {
    if (this._busy) return;
    if ((e.button === 0) || (e.button === 1)) {
        this.drag_mx = e.clientX;
        this.drag_my = e.clientY;
        this.drag_cx = this.posX;

        this.d_b_move = document.body.onmousemove;
        this.d_b_up = document.body.onmouseup;
        var _c=this;
        document.body.onmouseup = function(e){_c.stopDrag(e||event);_c=null;}
        document.body.onmousemove = function (e) {_c.onDrag(e||event);}
        this._busy=true;
    }
}
/**
 *   @desc: on drag change position
 *   @type: private
 */
dhtmlxSlider.prototype.onDrag = function(e) {
    if (this._busy) {
        if (!this.vMode)
            this.posX = this.drag_cx + e.clientX - this.drag_mx;
        else
            this.posX = this.drag_cx + e.clientY - this.drag_my;
        this._applyPos();
    }
}

/**
 *   @desc: start slider drag
 *   @type: private
 */
dhtmlxSlider.prototype.startDrag2 = function(e) {
    if (this._busy) return;
    if ((e.button === 0) || (e.button === 1)) {
        this.drag2_mx = e.clientX;
        this.drag2_my = e.clientY;
        this.drag2_cx = this.posX2;

        this.d_b_move = document.body.onmousemove;
        this.d_b_up = document.body.onmouseup;
        var _c=this;
        document.body.onmouseup = function(e){_c.stopDrag2(e||event);_c=null;}
        document.body.onmousemove = function (e) {_c.onDrag2(e||event);}
        this._busy=true;
    }
}
/**
 *   @desc: on drag change position
 *   @type: private
 */
dhtmlxSlider.prototype.onDrag2 = function(e) {
    if (this._busy) {
        if (!this.vMode)
            this.posX2 = this.drag2_cx + e.clientX - this.drag2_mx;
        else
            this.posX2 = this.drag2_cx + e.clientY - this.drag2_my;
        this._applyPos();
    }
}
/**
 *   @desc: on stop draging (onmouseup)
 *   @type: private
 */
dhtmlxSlider.prototype.stopDrag = function(e) {
    document.body.onmousemove = this.d_b_move?this.d_b_move:null;
    document.body.onmouseup = this.d_b_up?this.d_b_up:null;
    this.d_b_move=this.d_b_up=null;
    this._busy=false;
    this.callEvent("onSlideEnd",[this.getValue()])
    EnFolks_get_object("EnergyFolksSubmit").click();
}

/**
 *   @desc: on stop draging (onmouseup)
 *   @type: private
 */
dhtmlxSlider.prototype.stopDrag2 = function(e) {
    document.body.onmousemove = this.d_b_move?this.d_b_move:null;
    document.body.onmouseup = this.d_b_up?this.d_b_up:null;
    this.d_b_move=this.d_b_up=null;
    this._busy=false;
    this.callEvent("onSlideEnd",[this.getValue2()])
    EnFolks_get_object("EnergyFolksSubmit").click();
}

/**
 *   @desc: get value of slider control
 *   @type: public
 *   @topic: 1
 */
dhtmlxSlider.prototype.getValue=function(){
    if ((!this._busy) && (this.inputPriority))
        return (Math.round (this.value / this._step) * this._step).toFixed(6)-0;
    return Math.round((Math.round((this.posX/this._mod)/this._step)*this._step+this.shift*1)*10000)/10000;
};

/**
 *   @desc: get value of slider control
 *   @type: public
 *   @topic: 1
 */
dhtmlxSlider.prototype.getValue2=function(){
    if ((!this._busy) && (this.inputPriority))
        return (Math.round (this.value / this._step) * this._step).toFixed(6)-0;
    return Math.round((Math.round((this.posX2/this._mod)/this._step)*this._step+this.shift*1)*10000)/10000;
};
/**
 *   @desc: set value of slider control
 *   @param: val - (integer) new value
 *   @type: public
 *   @topic: 1
 */
dhtmlxSlider.prototype.setValue=function(val, skip){
    if (isNaN(val)) return;
    this._def[3] = this.value = val-0;
    this.posX=(Math.round(((val||0)-this.shift)*this._mod))
    this._applyPos(skip==null?true:skip);
};

/**
 *   @desc: return element marked for action
 *   @type: private
 */
dhtmlxSlider.prototype._getActionElement=function(nod){
    if (nod._etype) return nod;
    if (nod.parentNode) return this._getActionElement(nod.parentNode);
    return null;
}
/**
 *   @desc: global onmouse event
 *   @type: private
 */
dhtmlxSlider.prototype._onMouseDown=function(e){
    if(this.that.disabled) return;
    e=e||event;
    var that=this.that;
    var nod=that._getActionElement(_isIE?e.srcElement:e.target);
    switch (nod._etype){
        case "slider":
            break;
            if (that.vMode)
                var z=e.clientY-(getAbsoluteTop(that.con)-document.body.scrollTop);
            else
                var z=e.clientX-(getAbsoluteLeft(that.con)-document.body.scrollLeft);
            var posX = that.posX;
            that.posX = z-that.dragLeft-that.dragWidth/2;
            that.direction = that.posX > posX ? 1 : -1;
            if (that.stepping) {
                clearInterval (that._int);
                that.setValue (that.value + that._step * that.direction, false);
                that._int = setInterval (function () {that.setValue (that.value + that._step * that.direction, false)}, 600);
            }
            else
            {
                that._busy=true;
                that._applyPos();
                that._busy = false;
            }

            break;
        case "drag":
            that.startDrag(e||event);
            break;
        case "drag2":
            that.startDrag2(e||event);
            break;
    }
    return false;
}

/**
 *   @desc: set onChange handler
 *   @param: func - (string|function) user defined function
 *   @type: public
 *   @topic: 1
 */
dhtmlxSlider.prototype.setOnChangeHandler=function(func){
    this.attachEvent("onChange",func);
}

/**
 *   @desc: inner onChange handler
 *   @type: private
 */
dhtmlxSlider.prototype._linkFrom=function(){if(this.disabled) return;this.setValue (parseFloat (this._link.value), false);};
/**
 *   @desc: link slider to other control
 *   @param: obj - (string|object) linked object id, or linked object itself
 *   @type: public
 *   @topic: 1
 */
dhtmlxSlider.prototype.linkTo=function(obj){
    obj = (typeof(obj) != "object") ? document.getElementById(obj) : obj;
    this._link = obj;
    var name=obj.tagName.toString().toLowerCase();
    this._linkBoth=(((name=="input")||(name=="select")||(name=="textarea"))?1:0);
    if (this._linkBoth){
        var self=this;
        var f=function(){
            if (this._nextSlider) window.clearTimeout(this._nextSlider);
            this._nextSlider=window.setTimeout(function(){self._linkFrom()},500);
        };
        obj.onblur=obj.onkeypress=obj.onchange=f;
    }
    this._applyPos();
}
/**
 *   @desc: enable/disable tooplips ( enabled by default )
 *   @param: mode - (boolean)
 *   @type: public
 *   @topic: 1
 */
dhtmlxSlider.prototype.enableTooltip=function(mode){
    this._dttp=(!convertStringToBoolean(mode));
    this._setTooltip(this._dttp?"":this.getValue());
}

/**
 *     @desc: set path to images
 *     @type: public
 *			@params: path - path to images
 *     @topic: 0
 */
dhtmlxSlider.prototype.setImagePath = function(path){
    this.imgURL = path;
}

/**
 *		@desc: initialization of dhtmlxSlider object
 *		@type: public
 *		@topic: 0
 */
dhtmlxSlider.prototype.init = function() {
    this.isInit = true;
    this.createStructure();
}

/**
 * @dest: set user input priority over automatic calculation
 * @type: public
 * @topic: 1
 */
dhtmlxSlider.prototype.setInputPriority = function (mode) {
    this.inputPriority = mode;
}

/**
 * @dest: set stepping mode for slider.
 * @type: public
 * @topic: 1
 */
dhtmlxSlider.prototype.setSteppingMode = function (mode) {
    this.stepping = mode;
}
/**
 * @dest: disable slider
 * @type: public
 * @topic: 1
 */
dhtmlxSlider.prototype.disable = function (mode) {
    this.disabled = mode;
};


//slider
(function(){
    dhtmlx.extend_api("dhtmlxSlider",{
        _init:function(obj){
            return [ obj.parent, obj.size, obj.skin, obj.vertical, obj.min, obj.max, obj.value, obj.step ];
        },
        link:"linkTo"
    },{});
})();

//START
//v.2.6 build 100722

/*
 Copyright DHTMLX LTD. http://www.dhtmlx.com
 You allowed to use this component or parts of it under GPL terms
 To use it on other terms or get Professional edition of the component please contact us at sales@dhtmlx.com
 */
function dhx_init_sliders(){
    var z=document.getElementsByTagName("input");
    for (var i=0; i<z.length; i++)
        if (z[i].className=="dhtmlxSlider"){
            var n=z[i];
            var pos=n.getAttribute("position")||"over";
            var d=document.createElement("DIV");
            d.style.width=n.offsetWidth+"px";
            d.style.height=n.offsetHeight+"px";
            n.parentNode.insertBefore(d,n);
            if (pos=="over")
                n.style.display="none";
            else{
                var x=document.createElement("DIV");

                var w=Math.round(n.offsetWidth/3);
                if (w>50) w=50

                x.style.width=n.offsetWidth-w+"px";
                d.style.position="relative";
                x.style[(pos=="left")?"right":"left"]=x.style.top=n.style.top=n.style[pos]="0px";
                x.style.position=n.style.position="absolute";
                n.style.width=w+"px";
                x.style.height=n.offsetHeight+"px";
                d.appendChild(n);d.appendChild(x);

                d=x;
            }
            var l=new dhtmlxSlider(d,d.offsetWidth,(n.getAttribute("skin")||""),false,(n.getAttribute("min")||""),(n.getAttribute("max")||""),(n.value),(n.getAttribute("step")||""));
            l.linkTo(n);
            l.init();
        }
}

if (window.addEventListener) window.addEventListener("load",dhx_init_sliders,false);
else    if (window.attachEvent) window.attachEvent("onload",dhx_init_sliders);


var dateFormat = function () {
    var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
        timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
        timezoneClip = /[^-+\dA-Z]/g,
        pad = function (val, len) {
            val = String(val);
            len = len || 2;
            while (val.length < len) val = "0" + val;
            return val;
        };

    // Regexes and supporting functions are cached through closure
    return function (date, mask, utc) {
        var dF = dateFormat;

        // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
        if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
            mask = date;
            date = undefined;
        }

        // Passing date through Date applies Date.parse, if necessary
        date = date ? new Date(date) : new Date;
        if (isNaN(date)) throw SyntaxError("invalid date");

        mask = String(dF.masks[mask] || mask || dF.masks["default"]);

        // Allow setting the utc argument via the mask
        if (mask.slice(0, 4) == "UTC:") {
            mask = mask.slice(4);
            utc = true;
        }

        var	_ = utc ? "getUTC" : "get",
            d = date[_ + "Date"](),
            D = date[_ + "Day"](),
            m = date[_ + "Month"](),
            y = date[_ + "FullYear"](),
            H = date[_ + "Hours"](),
            M = date[_ + "Minutes"](),
            s = date[_ + "Seconds"](),
            L = date[_ + "Milliseconds"](),
            o = utc ? 0 : date.getTimezoneOffset(),
            flags = {
                d:    d,
                dd:   pad(d),
                ddd:  dF.i18n.dayNames[D],
                dddd: dF.i18n.dayNames[D + 7],
                m:    m + 1,
                mm:   pad(m + 1),
                mmm:  dF.i18n.monthNames[m],
                mmmm: dF.i18n.monthNames[m + 12],
                yy:   String(y).slice(2),
                yyyy: y,
                h:    H % 12 || 12,
                hh:   pad(H % 12 || 12),
                H:    H,
                HH:   pad(H),
                M:    M,
                MM:   pad(M),
                s:    s,
                ss:   pad(s),
                l:    pad(L, 3),
                L:    pad(L > 99 ? Math.round(L / 10) : L),
                t:    H < 12 ? "a"  : "p",
                tt:   H < 12 ? "am" : "pm",
                T:    H < 12 ? "A"  : "P",
                TT:   H < 12 ? "AM" : "PM",
                Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
            };

        return mask.replace(token, function ($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });
    };
}();

// Some common format strings
dateFormat.masks = {
    "default":      "ddd mmm dd yyyy HH:MM:ss",
    shortDate:      "m/d/yy",
    mediumDate:     "mmm d, yyyy",
    longDate:       "mmmm d, yyyy",
    fullDate:       "dddd, mmmm d, yyyy",
    shortTime:      "h:MM TT",
    mediumTime:     "h:MM:ss TT",
    longTime:       "h:MM:ss TT Z",
    isoDate:        "yyyy-mm-dd",
    isoTime:        "HH:MM:ss",
    isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
    dayNames: [
        EnFolksLanguage.ssunday, EnFolksLanguage.smonday, EnFolksLanguage.stuesday, EnFolksLanguage.swednesday, EnFolksLanguage.sthursday, EnFolksLanguage.sfriday, EnFolksLanguage.ssaturday,
        EnFolksLanguage.sunday, EnFolksLanguage.monday, EnFolksLanguage.tuesday, EnFolksLanguage.wednesday, EnFolksLanguage.thursday, EnFolksLanguage.friday, EnFolksLanguage.saturday
    ],
    monthNames: [
        EnFolksLanguage.sjanuary, EnFolksLanguage.sfebruary, EnFolksLanguage.smarch, EnFolksLanguage.sapril, EnFolksLanguage.smay, EnFolksLanguage.sjune, EnFolksLanguage.sjuly, EnFolksLanguage.saugust, EnFolksLanguage.sseptember, EnFolksLanguage.soctober, EnFolksLanguage.snovember, EnFolksLanguage.sdecember,
        EnFolksLanguage.january, EnFolksLanguage.february, EnFolksLanguage.march, EnFolksLanguage.april, EnFolksLanguage.may, EnFolksLanguage.june, EnFolksLanguage.july, EnFolksLanguage.august, EnFolksLanguage.september, EnFolksLanguage.october, EnFolksLanguage.november, EnFolksLanguage.december
    ]
};

// For convenience...
Date.prototype.format = function (mask, utc) {
    return dateFormat(this, mask, utc);
};

/**
 * Calendar Script
 * Creates a calendar widget which can be used to select the date more easily than using just a text box
 * http://www.openjs.com/scripts/ui/calendar/
 *
 * Example:
 * <input type="text" name="date" id="date" />
 * <script type="text/javascript">
 * 		calendar.set("date");
 * </script>
 */
calendar = {
    month_names: [EnFolksLanguage.january, EnFolksLanguage.february, EnFolksLanguage.march, EnFolksLanguage.april, EnFolksLanguage.may, EnFolksLanguage.june, EnFolksLanguage.july, EnFolksLanguage.august, EnFolksLanguage.september, EnFolksLanguage.october, EnFolksLanguage.november, EnFolksLanguage.december],
    weekdays: [EnFolksLanguage.ssunday, EnFolksLanguage.smonday, EnFolksLanguage.stuesday, EnFolksLanguage.swednesday, EnFolksLanguage.sthursday, EnFolksLanguage.sfriday, EnFolksLanguage.ssaturday],
    month_days: [31,28,31,30,31,30,31,31,30,31,30,31],
    dateformat: "MM/DD/YYYY",
    //Get today's date - year, month, day and date
    today : new Date(),
    opt : {},
    data: [],

    //Functions
    /// Used to create HTML in a optimized way.
    wrt:function(txt) {
        this.data.push(txt);
    },

    /* Inspired by http://www.quirksmode.org/dom/getstyles.html */
    getStyle: function(ele, property){
        if (ele.currentStyle) {
            var alt_property_name = property.replace(/\-(\w)/g,function(m,c){return c.toUpperCase();});//background-color becomes backgroundColor
            var value = ele.currentStyle[property]||ele.currentStyle[alt_property_name];

        } else if (window.getComputedStyle) {
            property = property.replace(/([A-Z])/g,"-$1").toLowerCase();//backgroundColor becomes background-color

            var value = document.defaultView.getComputedStyle(ele,null).getPropertyValue(property);
        }

        //Some properties are special cases
        if(property == "opacity" && ele.filter) value = (parseFloat( ele.filter.match(/opacity\=([^)]*)/)[1] ) / 100);
        else if(property == "width" && isNaN(value)) value = ele.clientWidth || ele.offsetWidth;
        else if(property == "height" && isNaN(value)) value = ele.clientHeight || ele.offsetHeight;
        return value;
    },
    getPosition:function(ele) {
        var x = 0;
        var y = 0;
        while (ele) {
            x += ele.offsetLeft;
            y += ele.offsetTop;
            ele = ele.offsetParent;
        }
        if (navigator.userAgent.indexOf("Mac") != -1 && typeof document.body.leftMargin != "undefined") {
            x += document.body.leftMargin;
            offsetTop += document.body.topMargin;
        }

        var xy = new Array(x,y);
        return xy;
    },
    /// Called when the user clicks on a date in the calendar.
    selectDate:function(year,month,day) {
        var ths = _calendar_active_instance;
        if(this.dateformat == "MM/DD/YYYY")
            document.getElementById(ths.opt["input"]).value = month + "/" + day + "/" + year;
        if(this.dateformat == "DD/MM/YYYY")
            document.getElementById(ths.opt["input"]).value = day + "/" + month + "/" + year;
        if(this.dateformat == "YYYY/MM/DD")
            document.getElementById(ths.opt["input"]).value = year + "/" + month + "/" + day;
        if(this.dateformat == "YYYY/DD/MM")
            document.getElementById(ths.opt["input"]).value = year + "/" + day + "/" + month;
        if(this.dateformat == "DD/YYYY/MM")
            document.getElementById(ths.opt["input"]).value = day + "/" + year + "/" + month;
        if(this.dateformat == "MM/YYYY/DD")
            document.getElementById(ths.opt["input"]).value = month + "/" + year + "/" + day;
        ths.hideCalendar();
    },
    /// Creates a calendar with the date given in the argument as the selected date.
    makeCalendar:function(year, month, day) {
        year = parseInt(year);
        month= parseInt(month);
        day	 = parseInt(day);

        //Display the table
        var next_month = month+1;
        var next_month_year = year;
        if(next_month>=12) {
            next_month = 0;
            next_month_year++;
        }

        var previous_month = month-1;
        var previous_month_year = year;
        if(previous_month< 0) {
            previous_month = 11;
            previous_month_year--;
        }

        this.wrt("<table>");
        this.wrt("<tr><th><a style='text-decoration:none;' href='javascript:calendar.makeCalendar("+(previous_month_year)+","+(previous_month)+");' title='"+this.month_names[previous_month]+" "+(previous_month_year)+"'>&lt;</a></th>");
        this.wrt("<th colspan='5' style='text-align:center;'><select style='width:90px;' name='calendar-month' class='calendar-month' onChange='calendar.makeCalendar("+year+",this.value);'>");
        for(var i=0;i<12;i++) {
            this.wrt("<option value='"+i+"'");
            if(i == month) this.wrt(" selected='selected'");
            this.wrt(">"+this.month_names[i]+"</option>");
        }
        this.wrt("</select>");
        this.wrt("<select style='width:70px;'name='calendar-year' class='calendar-year' onChange='calendar.makeCalendar(this.value, "+month+");'>");
        var current_year = this.today.getYear();
        if(current_year < 1900) current_year += 1900;

        for(var i=current_year-70; i<current_year+10; i++) {
            this.wrt("<option value='"+i+"'")
            if(i == year) this.wrt(" selected='selected'");
            this.wrt(">"+i+"</option>");
        }
        this.wrt("</select></th>");
        this.wrt("<th><a style='text-decoration:none;' href='javascript:calendar.makeCalendar("+(next_month_year)+","+(next_month)+");' title='"+this.month_names[next_month]+" "+(next_month_year)+"'>&gt;</a></th></tr>");
        this.wrt("<tr class='header'>");
        for(var weekday=0; weekday<7; weekday++) this.wrt("<td>"+this.weekdays[weekday]+"</td>");
        this.wrt("</tr>");

        //Get the first day of this month
        var first_day = new Date(year,month,1);
        var start_day = first_day.getDay();

        var d = 1;
        var flag = 0;

        //Leap year support
        if(year % 4 == 0) this.month_days[1] = 29;
        else this.month_days[1] = 28;

        var days_in_this_month = this.month_days[month];

        //Create the calender
        for(var i=0;i<=5;i++) {
            if(w >= days_in_this_month) break;
            this.wrt("<tr>");
            for(var j=0;j<7;j++) {
                if(d > days_in_this_month) flag=0; //If the days has overshooted the number of days in this month, stop writing
                else if(j >= start_day && !flag) flag=1;//If the first day of this month has come, start the date writing

                if(flag) {
                    var w = d, mon = month+1;
                    if(w < 10)	w	= "0" + w;
                    if(mon < 10)mon = "0" + mon;

                    //Is it today?
                    var style_name = '';
                    var class_name = '';
                    var yea = this.today.getYear();
                    if(yea < 1900) yea += 1900;

                    if(yea == year && this.today.getMonth() == month && this.today.getDate() == d) class_name = "other_day";
                    if(day == d) class_name = "today";

                    style_name += " " + this.weekdays[j].toLowerCase();

                    this.wrt("<td style='width:14%;"+style_name+"' class='enfolks_days "+class_name+"'><a style='text-decoration:none;' href='javascript:calendar.selectDate(\""+year+"\",\""+mon+"\",\""+w+"\")'>"+w+"</a></td>");
                    d++;
                } else {
                    this.wrt("<td class='days' style='width:14%;'>&nbsp;</td>");
                }
            }
            this.wrt("</tr>");
        }
        this.wrt("</table>");
        this.wrt("<div align=center style='text-align:center'><button style='width:60%;' class='calendar-cancel' onclick='calendar.hideCalendar();'>Cancel</button></div>");

        document.getElementById(this.opt['calendar']).innerHTML = this.data.join("");
        this.data = [];
    },

    /// Display the calendar - if a date exists in the input box, that will be selected in the calendar.
    showCalendar: function() {
        var input = document.getElementById(this.opt['input']);

        //Position the div in the correct location...
        var div = document.getElementById(this.opt['calendar']);
        var xy = this.getPosition(input);
        var width = parseInt(this.getStyle(input,'width'));
        div.style.left=(xy[0]+width+10)+"px";
        div.style.top=xy[1]+"px";

        // Show the calendar with the date in the input as the selected date
        var existing_date = new Date();
        var date_in_input = input.value;
        if(date_in_input) {
            var selected_date = false;
            var date_parts = date_in_input.split("/");
            if(date_parts.length == 3) {
                //date_parts[0]--; //Month starts with 0
                if(this.dateformat == "MM/DD/YYYY")
                    selected_date = new Date(date_parts[2], date_parts[0]-1, date_parts[1]);
                if(this.dateformat == "DD/MM/YYYY")
                    selected_date = new Date(date_parts[2], date_parts[1]-1, date_parts[0]);
                if(this.dateformat == "YYYY/MM/DD")
                    selected_date = new Date(date_parts[0], date_parts[1]-1, date_parts[2]);
                if(this.dateformat == "YYYY/DD/MM")
                    selected_date = new Date(date_parts[0], date_parts[2]-1, date_parts[1]);
                if(this.dateformat == "MM/YYYY/DD")
                    selected_date = new Date(date_parts[1], date_parts[0]-1, date_parts[2]);
                if(this.dateformat == "DD/YYYY/MM")
                    selected_date = new Date(date_parts[1], date_parts[2]-1, date_parts[0]);
            }
            if(selected_date && !isNaN(selected_date.getYear())) { //Valid date.
                existing_date = selected_date;
            }
        }

        var the_year = existing_date.getYear();
        if(the_year < 1900) the_year += 1900;
        this.makeCalendar(the_year, existing_date.getMonth(), existing_date.getDate());
        document.getElementById(this.opt['calendar']).style.display = "block";
        _calendar_active_instance = this;
    },

    /// Hides the currently show calendar.
    hideCalendar: function(instance) {
        var active_calendar_id = "";
        if(instance) active_calendar_id = instance.opt['calendar'];
        else active_calendar_id = _calendar_active_instance.opt['calendar'];

        if(active_calendar_id) document.getElementById(active_calendar_id).style.display = "none";
        _calendar_active_instance = {};
    },

    /// Setup a text input box to be a calendar box.
    set: function(input_id) {
        var input = document.getElementById(input_id);
        if(!input) return; //If the input field is not there, exit.

        if(!this.opt['calendar']) this.init();

        var ths = this;
        input.onclick=function(){
            ths.opt['input'] = this.id;
            ths.showCalendar();
        };
    },

    /// Will be called once when the first input is set.
    init: function() {
        if(!this.opt['calendar'] || !document.getElementById(this.opt['calendar'])) {
            var div = document.createElement('div');
            if(!this.opt['calendar']) this.opt['calendar'] = 'calender_div_'+ Math.round(Math.random() * 100);

            div.setAttribute('id',this.opt['calendar']);
            div.className="calendar-box";
            setStyle(div,"display:none;z-index:1000;background-color:#fff;border:1px solid #444;position:absolute;width:250px;padding: 5px;");
            document.getElementsByTagName("body")[0].insertBefore(div,document.getElementsByTagName("body")[0].firstChild);
        }
    }
}

EnFolksSubForm = function(id,postid,replyid) {
    var html=EnFolks_get_object(id+'html').value.replace(/^\s+|\s+$/g,"");
    if(html == "") return;
    var ajaxRequest;  // The variable that makes Ajax possible!

    try{
        // Opera 8.0+, Firefox, Safari
        ajaxRequest = new XMLHttpRequest();
    } catch (e){
        // Internet Explorer Browsers
        try{
            ajaxRequest = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            try{
                ajaxRequest = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (e){
                // Something went wrong
                alert("Your browser does not seem to support AJAX calls.  You will not be able to login.");
                return false;
            }
        }
    }
    // Create a function that will receive data sent from the server
    ajaxRequest.onreadystatechange = function(id){return function(){
        if(ajaxRequest.readyState == 4) {
            EnFolks_get_object(id).innerHTML=ajaxRequest.responseText;
        }
    };}(id);
    var anon=0;
    if(EnFolks_get_object(id+"anon").checked) anon=1;
    var subs=0;
    if(EnFolks_get_object(id+"subs").checked) subs=1;
    var params="anonymous=" + anon +"&subscribe="+subs+"&comment=" + escape(html);
    EnFolks_get_object(id).innerHTML="<img src='https://images.energyfolks.com/images/loader.gif' class=inline><h6>Submitting Comment...</h6>";
    ajaxRequest.open("POST", "https://www.energyfolks.com/announce/newComment/"+postid+"/"+replyid, true);
    ajaxRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    ajaxRequest.setRequestHeader("Content-length", params.length);
    ajaxRequest.setRequestHeader("Connection", "close");
    ajaxRequest.send(params);
}

function setStyle( object, styleText ) {if( object.style.setAttribute ) {object.style.setAttribute("cssText", styleText );} else {object.setAttribute("style", styleText );}}
function EnFolksShareIt(obj,type,id,share_url,share_msg) {
    obj.innerHTML=obj.innerHTML*1+1;
    if(type == 'facebook') {
        var url = "http://www.facebook.com/sharer.php?u="
            + share_url;
        url += "&t=" + share_msg;
        window.open(url, "facebook", "toolbar=no, width=550, height=550");
    }
    if(type == 'twitter') {
        var url = "http://twitter.com/intent/tweet?text="
            + share_msg;
        url += "&url=" + share_url;
        window.open(url, 'twitter', "toolbar=no, width=550, height=550");
    }
    if(type == 'linkedin') {
        var url="https://api.addthis.com/oexchange/0.8/forward/linkedin/offer?url=" + share_url + "&title=" + share_msg;
        window.open(url, 'linkedin', "toolbar=no, width=550, height=550");
    }
    var url="https://www.energyfolks.com/"
    if(share_url.indexOf("announce",0)>0)
        url+="announce";
    else if(share_url.indexOf("jobs",0)>0)
        url+="jobs";
    else if(share_url.indexOf("calendar",0)>0)
        url+="calendar";
    else
        return;
    url+="/Share/"+type+"/"+id;
    var head= document.getElementsByTagName('head')[0];
    var script= document.createElement('script');
    script.type= 'text/javascript';
    script.src= url;
    head.appendChild(script);
}
function EnFolksScrollToElement(input){
    var theElement=EnFolks_get_object(input);
    var selectedPosX = 0;
    var selectedPosY = 0;

    while(theElement != null){
        selectedPosX += theElement.offsetLeft;
        selectedPosY += theElement.offsetTop;
        theElement = theElement.offsetParent;
    }
    EnFolksSmoothScroll(Math.max(0,selectedPosY-300));

}
var EnFolksDoneOver=true;
EnFolksCheckReviewTries=new Array();
function EnFolksCheckReview(id) {
    if(EnFolksCheckReviewTries[id] != 1) EnFolksCheckReviewWaiter(id);
}
function EnFolksCheckReviewWaiter(id) {
    EnFolksCheckReviewTries[id]=1;
    if(window.location.hash.search("reviewdone"+id) > -1) {
        EnFolksCheckReviewTries[id]=0;
        var revid=window.location.hash.split("_");
        EnFolks_get_object("commentboxrr"+id).innerHTML='<img src="https://images.energyfolks.com/images/loader.gif">';
        var head= document.getElementsByTagName('body')[0];
        var script= document.createElement('script');
        script.type= 'text/javascript';
        script.src= "https://www.energyfolks.com/announce/ShowComment/"+id+'/'+revid[1]+"/"+EnFolksAffiliateId;
        head.appendChild(script);
        return true;
    } else if(window.location.hash.search("reviewJSdone"+id) > -1) {
        EnFolksCheckReviewTries[id]=0;
        var revid=window.location.hash.split("_");
        if(id == 0)
            EnFolks_get_object("commentboxrrm"+revid[2]).innerHTML='<img src="https://images.energyfolks.com/images/loader.gif">';
        else
            EnFolks_get_object("commentboxrr"+id).innerHTML='<img src="https://images.energyfolks.com/images/loader.gif">';
        var head= document.getElementsByTagName('body')[0];
        var script= document.createElement('script');
        script.type= 'text/javascript';
        script.src= "https://www.energyfolks.com/announce/ShowCommentJS/"+id+'/'+revid[1]+"/"+EnFolksAffiliateId;
        head.appendChild(script);
        return true;
    }
    window.setTimeout(function(id) {return function() {EnFolksCheckReviewWaiter(id);};}(id),500);
}
function EnFolksMessage(url) {
    EnFolksMessageSize(url,800,600);
}
function EnFolksMessageSize(url, wid, high) {
    var cur_url=window.location.href;
    if(EnFolks_get_object('NotEnFolks')) {
        window.location.href=url;
        return;
    }
    var winsize=EnFolks_getWindowSize();
    if(navigator.userAgent.indexOf('Safari') != -1) {
        if(url.indexOf("CreateAccountExternal") != -1) {
            window.open (url, "safari_bug_window","location=0,status=0,scrollbars=0, width="+wid+",height="+high);
            return;
        }
    }


    if(high > (winsize[1]-90)) high=winsize[1]-90;
    //EnFolks_get_object('EnFolks_messagebar').style.backgroundColor='#'+EnFolks_Default_Color;
    //EnFolks_get_object('EnFolks_messagebar').style.height='2px';
    EnFolksMessageDirect("<iframe src='"+url+"#"+cur_url.replace(/#.*/, "").replace(/\./g,"_dot_").replace(/\//g,"_slash_").replace(/\:/g,"_colon_").replace("?","_qmark_").replace(/&/g,"_amp_").replace(/=/g,"_equals_")+"' frameborder=0 border=0 style='border:0px solid black;width:" + wid + "px;height:" + high + "px;overflow:auto;'></iframe>",wid,high);
}
function EnFolksMessageDirect(inhtml,wid,high) {
    EnFolks_get_object('EnFolks_message').innerHTML=inhtml;
    EnFolks_get_object('EnFolks_messageclose').innerHTML='<a href="javascript:EnFolks_closemessage()" style="color:#fff;">Close <img src="https://images.energyfolks.com/images/deleteon2.png" class="inline" border=0></a>';
    EnFolks_get_object('EnFolks_messagewrap').style.display='block';
    EnFolks_get_object('EnFolks_message2').style.width=wid+'px';
    EnFolks_get_object('EnFolks_message2').style.height=high+'px';
    EnFolks_get_object('EnFolks_message').style.display='none';
    EnFolks_get_object('EnFolks_message2').style.display='block';
    //EnFolks_get_object('EnFolks_message').style.display='block';
    //EnFolks_get_object('EnFolks_message2').style.display='none';
    EnFolks_greyouton();
    EnFolks_get_object('EnFolks_messagewrap').style.left=0 + 'px';
    EnFolks_get_object('EnFolks_messagewrap').style.top=0 + 'px';
    var offset=new Array(window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
        window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop);
    var dim=EnFolks_getdimension('EnFolks_messagewrap')
    var mx=dim.width;
    var my=dim.height;
    //alert('windowx: ' + winsize[0] + ' windowy: ' + winsize[1] + ' element x: ' + mx + ' element y: ' + my + ' scroll x: ' + offset[0] + ' scroll y: ' + offset[1]);
    var winsize=EnFolks_getWindowSize();
    var newx=Math.round((winsize[0]-mx)/2);
    if(newx < 0) newx=0;
    newx=newx+offset[0];
    var newy=Math.round((winsize[1]-my)/2);
    if(newy < 0) newy=0;
    newy=newy+offset[1];
    EnFolks_get_object('EnFolks_messagewrap').style.left=newx + 'px';
    EnFolks_get_object('EnFolks_messagewrap').style.top='20px';
}
function EnFolks_getdimension(element) {
    element = EnFolks_get_object(element);
    var display = element.style.display;
    if (display != 'none' && display != null) // Safari bug
        return {width: element.offsetWidth, height: element.offsetHeight};
    // All *Width and *Height properties give 0 on elements with display none,
    // so enable the element temporarily
    var els = element.style;
    var originalVisibility = els.visibility;
    var originalPosition = els.position;
    var originalDisplay = els.display;
    els.visibility = 'hidden';
    els.position = 'absolute';
    els.display = 'block';
    var originalWidth = element.clientWidth;
    var originalHeight = element.clientHeight;
    els.display = originalDisplay;
    els.position = originalPosition;
    els.visibility = originalVisibility;
    return {width: originalWidth, height: originalHeight};
}
var EnFolksBrowser = {
    IE:     !!(window.attachEvent &&
        navigator.userAgent.indexOf('Opera') === -1),
    Opera:  navigator.userAgent.indexOf('Opera') > -1,
    WebKit: navigator.userAgent.indexOf('AppleWebKit/') > -1,
    Gecko:  navigator.userAgent.indexOf('Gecko') > -1 &&
        navigator.userAgent.indexOf('KHTML') === -1,
    MobileSafari: !!navigator.userAgent.match(/Apple.*Mobile.*Safari/)
};

function EnFolksWaitForLoad() {
    window.setTimeout(function() {
        EnFolks_get_object('EnFolks_message2').style.display='none';
        EnFolks_get_object('EnFolks_message').style.display='block';
    },500);
}
function EnFolks_greyouton() {
    var y = (document.height !== undefined) ? document.height : document.body.offsetHeight;
    var x = (document.width !== undefined) ? document.width : document.body.offsetWidth;

    EnFolks_get_object('EnFolks_greyout').style.width=x + 'px';
    EnFolks_get_object('EnFolks_greyout').style.height=y + 'px';
    offset=[0,0];
    EnFolks_get_object('EnFolks_greyout').style.top=offset[1] + 'px';
    EnFolks_get_object('EnFolks_greyout').style.left=offset[0] + 'px';
    EnFolks_get_object('EnFolks_greyout').style.display='block';
}
function EnFolks_getWindowSize() {
    var myWidth = 0, myHeight = 0;
    if( typeof( window.innerWidth ) == 'number' ) {
        //Non-IE
        myWidth = window.innerWidth;
        myHeight = window.innerHeight;
    } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
        //IE 6+ in 'standards compliant mode'
        myWidth = document.documentElement.clientWidth;
        myHeight = document.documentElement.clientHeight;
    } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
        //IE 4 compatible
        myWidth = document.body.clientWidth;
        myHeight = document.body.clientHeight;
    }
    return Array(myWidth,myHeight);
}
function EnFolks_greyoutoff() {
    EnFolks_get_object('EnFolks_greyout').style.display='none';
}
function EnFolks_closemessage() {
    EnFolks_greyoutoff();
    EnFolks_get_object('EnFolks_messagewrap').style.display='none';
}