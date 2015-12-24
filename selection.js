var searchUrl;
var subject;
var bubbleDOM;
var sel;
var answer;

document.addEventListener('mouseup', function(e) {

    //Get the selected text by user.
    sel = window.getSelection().toString();

    //for determining whether selection is a valid MIT course
    var regex = /^\s?\d{1,2}\.[S]?\d{1,4}[a-zA-Z]?\s?$|^\s?\d{1,2}\.(EPW|THT|THU|THG|UAT|UAP|UAR|UR|URG){1}\s?$|^\s?(CC|CSB|EC|ES|ESD|HST|MAS|AS|MS|NS|STS|SWE|SP|WGS|CMS){1}\.[S]?\d{1,4}[a-zA-Z]?\s?$|21[AWGHLM]\.\d{1,4}[a-zA-Z]\s?/i;

    //narrow down options, and run script only if selection is (likely) valid MIT course number.
    if (sel.length < 10 && regex.test(sel) && e.target.className != "selection_bubble") {


        if (!$('.selection_bubble').is(":visible")) {
            bubbleDOM = document.createElement('div');
            bubbleDOM.setAttribute('class', 'selection_bubble');
            document.body.appendChild(bubbleDOM);
        }
        
        searchUrl = 'http://student.mit.edu/catalog/search.cgi?search=' + encodeURIComponent(sel);

        $.get("http://student.mit.edu/catalog/search.cgi?search=" + sel, function(data) {
            var subject = $(data)
                .find('blockquote')
                .html();

            var originalIconSource = 'src="\/icns';
            var originalLink = 'href="m';
            //Extra regex to ensure icons get displayed properly.
            subject = subject.replace(new RegExp(originalIconSource, 'g'), "src=\"http://student.mit.edu/icns");
            subject = subject.replace(new RegExp(originalLink, 'g'), "href=\"http://student.mit.edu/catalog/m");

            try {
            if (subject.match(/<h3>/g).length == 1) {
                subject = subject.substring(subject.indexOf('<h3>')); 
            }
           }
           catch(err){
                //console.log("No length found");
           }
            subject = subject + '\n <div id="block1"><a style="font-weight:bold" href="https://edu-apps.mit.edu/ose-rpt/subjectEvaluationSearch.htm?search=Search&subjectCode=' + encodeURIComponent(sel) + '">Subject Evaluations</a></div>';
            var r = '#results';
            var d = 'data-geo=""';

            //Display HKN Underground Guides as a popover if a valid Course 6 class.
            var regexCourse6 = /^\s?6\.[S]?\d{1,4}[a-zA-Z]?\s?$/i;
            if (regexCourse6.test(sel)) {

                subject = subject + '\n &nbsp; | &nbsp; <div id="block2" data-geo=""><a class="tooltiphkn" style="font-weight:bold" data-geo="" href="https://hkn.mit.edu/new_ug/search/search?utf8=%E2%9C%93&subject_num=' + encodeURIComponent(sel) + r + '"> HKN UnderGround Guide</a></div>';
            }
            
            //Various offset to display div in correct position on page.
            var parentOffset = $('.selection_bubble').offset();
            var relX = e.pageX - parentOffset.left;
            var relY = e.pageY - parentOffset.top;

            if (relX + 400 > $(window).width()) {
                relX = relX - 400;
            }
           
            if (relY + 200 > $(window).height()) {
                relY = relY - 200;
            }
          
            renderBubble(relX, relY, subject);
        })
    }
}, false);

//If user clicks outside tooltip, remove it. 
$(document).on('click', function(e) {
    if ($('.selection_bubble').html() != '' && (e.target.className != "selection_bubble")) {
        
        try{

        bubbleDOM.style.top = '0';
        bubbleDOM.style.left = '0';
        bubbleDOM.innerHTML = '';
        $('.selection_bubble').remove();
        }
        catch(err) {

           // console.log("No div found");
        }
    }
});

function renderBubble(mouseX, mouseY, selection) {

    bubbleDOM.innerHTML = selection;
    bubbleDOM.style.top = mouseY + 'px';
    bubbleDOM.style.left = mouseX + 'px';
    bubbleDOM.style.visibility = 'visible';

    $('.selection_bubble').show();

}

//Jquery tooltip to display the HKN underground hours/difficulty if Course 6 class.
$(document).tooltip({
    items: "[data-geo]",
    position: {
        my: "center top-7"
    },
    content: function() {
        var element = $(this);
        this.style.zindex = 12000;
      
        if (element.is("[data-geo]")) {
       
            $.ajax({
                type: "GET",
                url: "https://hkn.mit.edu/new_ug/search/search?utf8=%E2%9C%93&subject_num=" + encodeURIComponent(sel),
                async: false,
                success: function(data) {
                    //Get the hours, difficulty, and rating and parse the string
                    subject = $(data)[13].outerHTML.toString();
                    var rating = subject.match(/<td>(.*?)<\/td>/gi)[6];
                    var diff = subject.match(/<td>(.*?)<\/td>/gi)[5];
                    var hrs = subject.match(/<td>(.*?)<\/td>/gi)[7];                  
                    var div = document.createElement("div");
                    div.innerHTML = rating;
                    var ratingVal = div.innerText;
                    div.innerHTML = diff;
                    var diffVal = div.innerText;
                    div.innerHTML = hrs;
                    var hrsVal = div.innerText;
                    var content = 'Difficuly: ' + diffVal + ' ' + 'Rating: ' + ratingVal + ' ' + 'Hrs: ' + hrsVal;
                    answer = '<div id="hknNumbers">' + content + '</div>';

                }
            });
            return answer;
        }

    }
});
