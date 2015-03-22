angular.module('fbMetricsModule', ['chartjs-directive'])
    .controller('fbMetricsController', ['$scope', 'fbPageMetrics', function($scope, fbMetricsService) {
    var ctx = document.getElementById("championsChart").getContext("2d");
    /*
    var topCount = 5;
    fbMetricsService.init().then(function(msg){ 
            return fbMetricsService.getTopEngagers(180);
        }).then(function(response){
            var likers = response.likers
            var sortedLikers = Object.keys(likers).sort(function(a,b){return likers[b]-likers[a]})
            console.log(sortedLikers);
            var topLikers = [];
            var topLikeCounts = [];
            for(i=0;i<5;i++){
                topLikers.push(sortedLikers[i]);
                topLikeCounts.push(likers[sortedLikers[i]]);
            }
            var data = {
                labels: topLikers,
                datasets: [
                    {
                        label: "Top Likers",
                        fillColor: "rgba(220,220,220,0.5)",
                        strokeColor: "rgba(220,220,220,0.8)",
                        highlightFill: "rgba(220,220,220,0.75)",
                        highlightStroke: "rgba(220,220,220,1)",
                        data: topLikeCounts
                    }
                ]
            }
            var championsChart = new Chart(ctx).Bar(data,{scaleShowGridLines:false});
            
        });
    */
    

        
}]).controller("BarCtrl", ['$scope', 'fbPageMetrics', function ($scope, fbMetricsService) {
    var ctx = document.getElementById("championsChart").getContext("2d");
    //Chart.defaults.global.responsive = true;
    
    $scope.topCount = 5;
    $scope.topCountOpts = [{'name':'top 5','value':5},{'name':'top 10','value':10},{'name':'top 25','value':25}];
    $scope.engagementCategory = 'totalEngagements';
    $scope.categoryOpts = [{'name':'Likes','value':'likes'},{'name':'Comments','value':'comments'},{'name':'All Engagements','value':'totalEngagements'}];
    $scope.timeRange = 90;
    $scope.timeOpts = [{'name':'last 7 days','value':7},{'name':'last 1 month','value':30},{'name':'last 3 months','value':90},{'name':'last 6 months','value':180},{'name':'last 1 year','value':365}];
    
    var data = {
        labels: ["","","",""],
        datasets: [
            {
                label: "Top Likers",
                fillColor: "rgba(220,220,220,0.5)",
                strokeColor: "rgba(220,220,220,0.8)",
                highlightFill: "rgba(220,220,220,0.75)",
                highlightStroke: "rgba(220,220,220,1)",
                data: [0,0,0,0]
            }
        ]
    }
    window.championsChart = new Chart(ctx).Bar(data,{scaleShowGridLines:false});
    $scope.myChart = {"data": data, "options": {scaleShowGridLines:false} };
    fbMetricsService.init().then(function(msg){ 
            return fbMetricsService.getTopEngagers($scope.timeRange);
        }).then(function(response){
            
            $scope.topEngagers = response;
            $scope.sortEngagers();
            $scope.updateChart();        
        },function(reason) {
          alert('Failed: ' + reason);
        }, function(update) {
            for(i=0;i<window.championsChart.datasets[0].bars.length;i++){
                window.championsChart.datasets[0].bars[i].value = Math.floor((Math.random() * 20) + 1);
            }
            window.championsChart.update();
        });
    
    $scope.getRecentTopEngagers = function(){
        fbMetricsService.getTopEngagers($scope.timeRange).then(function(response){
            $scope.topEngagers = response;
            $scope.sortEngagers();
            $scope.updateChart();        
        },function(reason) {
          alert('Failed: ' + reason);
        }, function(update) {
            for(i=0;i<window.championsChart.datasets[0].bars.length;i++){
                window.championsChart.datasets[0].bars[i].value = Math.floor((Math.random() * 20) + 1);
            }
            window.championsChart.update();
        });
    }
    
    $scope.sortEngagers = function() {
        $scope.topEngagers.sort(function(a,b){return b[$scope.engagementCategory]-a[$scope.engagementCategory]})
    }
    $scope.updateChart = function() {
        var topLikers = [];
        var topLikeCounts = [];
        for(i=0;i<$scope.topCount;i++){
            topLikers.push($scope.topEngagers[i].name);
            topLikeCounts.push($scope.topEngagers[i][$scope.engagementCategory]);
        }

        var numBars = window.championsChart.datasets[0].bars.length
        if (numBars == $scope.topCount){
            for(i=0;i<numBars;i++){
                window.championsChart.datasets[0].bars[i].label = topLikers[i];
                window.championsChart.scale.xLabels[i] = topLikers[i];
                window.championsChart.datasets[0].bars[i].value = topLikeCounts[i];
            }
            window.championsChart.update();
        }
        else {
            var data = {
            labels: topLikers,
            datasets: [
                    {
                        label: "Top Likers",
                        fillColor: "rgba(220,220,220,0.4)",
                        strokeColor: "rgba(200,200,200,1)",
                        highlightFill: "rgba(220,220,220,0.75)",
                        highlightStroke: "rgba(220,220,220,1)",
                        data: topLikeCounts
                    }
                ]
            }
            $scope.myChart.data = data;
            for(i=0;i<numBars;i++)
                window.championsChart.removeData();
            window.championsChart = new Chart(ctx).Bar(data,{scaleShowGridLines:false});
        }
    }
    $scope.options = {scaleShowGridLines:false};
    
    Chart.defaults.global.customTooltips = function(tooltip) {
    	// Tooltip Element
        var tooltipEl = $('#chartjs-tooltip');
        // Hide if no tooltip
        if (!tooltip) {
            tooltipEl.css({
                opacity: 0
            });
            return;
        }
        // Set caret Position
        tooltipEl.removeClass('above below');
        tooltipEl.addClass(tooltip.yAlign);
        // Set Text
        var userName = tooltip.text.split(':')[0].trim();
        var imageUrl = null;
        for(i=0;i<$scope.topEngagers.length;i++){
            if($scope.topEngagers[i].name == userName){
                imageUrl = $scope.topEngagers[i].picture;
                break;
            }
        }
        tooltipEl.html("<div><img src='"+imageUrl+"'/></div>"+tooltip.text);
        // Find Y Location on page
        var top;
        if (tooltip.yAlign == 'above') {
            top = tooltip.y - tooltip.caretHeight - tooltip.caretPadding;
        } else {
            top = tooltip.y + tooltip.caretHeight + tooltip.caretPadding;
        }
        // Display, position, and set styles for font
        tooltipEl.css({
            opacity: 1,
            left: tooltip.chart.canvas.offsetLeft + tooltip.x + 'px',
            top: tooltip.chart.canvas.offsetTop + top + 'px',
            fontFamily: tooltip.fontFamily,
            fontSize: tooltip.fontSize,
            fontStyle: tooltip.fontStyle,
        });
    };
    
    
    
}])
    .service('fbPageMetrics', ['$http', '$q', '$rootScope', function ($http, $q, $rootScope) {
        var self = this;
        var pageId = '232860220165189';
        this.init = function() {
            var deferred = $q.defer();
            window.fbAsyncInit = function() {
                FB.init({
                  appId      : '1518308555115364',
                  xfbml      : true,
                  version    : 'v2.1'    
                });
                FB.getLoginStatus(function(response) {
                  if (response.status === 'connected') {
                    deferred.resolve('Logged in.');
                  }
                  else {
                    FB.login(function(){deferred.resolve('Logged in.')});
                  }
                });
            };

          (function(d, s, id){
             var js, fjs = d.getElementsByTagName(s)[0];
             if (d.getElementById(id)) {return;}
             js = d.createElement(s); js.id = id;
             js.src = "//connect.facebook.net/en_US/sdk.js";
             fjs.parentNode.insertBefore(js, fjs);
           }(document, 'script', 'facebook-jssdk'));
           
           return deferred.promise
        }
        this.getTopEngagers = function(daysBack){
            var deferred = $q.defer();
            var batchCount = 0;
            var now = new Date();
            var minDate = new Date(now.getTime()-daysBack*24*60*60*1000);
            var dateThreshold = false;
            var total = 0;
            var topEngagers = [];
            
            function User (id, name) {
                this.id = id;
                this.name = name;
                this.likes = 0;
                this.comments = 0;
                this.totalEngagements = 0;
                this.picture = "http://png-1.findicons.com/files/icons/85/kids/128/thumbnail.png";
                this.link = "";
            }
         var getProfilePics = function(response){
            var keys = Object.keys(response);
            for(i=0;i<keys.length;i++){
                for(j=0;j<topEngagers.length;j++){
                    if(topEngagers[j].id == keys[i]){
                        topEngagers[j].picture = response[keys[i]].picture.data.url;
                        topEngagers[j].link = response[keys[i]].link;
                        break;
                    } 
                }
            }
            batchCount -= 1;
            if(batchCount == 0)
                deferred.resolve(topEngagers);
         }
         var translateLikesAndComments = function(response) {
            var data = response.data;
            for(i=0;i<data.length;i++) {
                total +=1;
                created = new Date(data[i].created_time)
                if(created.getTime() <= minDate.getTime()){
                    console.log("found last date");
                    console.log(total);
                    dateThreshold = true;
                    break;
                }
                else {
                    //add likes and data paging
                    if(data[i].hasOwnProperty('likes')) {
                        for(j = 0;j < data[i].likes.data.length;j++) {
                            var userId = data[i].likes.data[j].id;
                            var userName = data[i].likes.data[j].name;
                            var userIndex = null;
                            var userExists = topEngagers.some(function (element, index, arr) {
                                if(element.id == userId){
                                    userIndex = index;
                                    return true;
                                }   
                            });
                            if(!userExists){
                                topEngagers.push(new User(userId, userName));
                                userIndex = topEngagers.length-1
                            }
                            topEngagers[userIndex].likes += 1;
                            topEngagers[userIndex].totalEngagements += 1;
                        }
                    }
                    if(data[i].hasOwnProperty('comments')) {
                        for(j = 0;j < data[i].comments.data.length;j++) {
                            var userId = data[i].comments.data[j].from.id;
                            var userName = data[i].comments.data[j].from.name;
                            var userIndex = null;
                            var userExists = topEngagers.some(function (element, index, arr) {
                                if(element.id == userId){
                                    userIndex = index;
                                    return true;
                                }   
                            });
                            if(!userExists){
                                topEngagers.push(new User(userId, userName));
                                userIndex = topEngagers.length-1;
                            }
                            topEngagers[userIndex].comments += 1;
                            topEngagers[userIndex].totalEngagements += 1;
                        }
                    }
                }
            }
            if(!dateThreshold) {
                deferred.notify("Getting another page");
                requestNextPage(response.paging.next).then(translateLikesAndComments);
            }
            else {
                console.log(topEngagers);
                var userIdArr = [];
                for(i=0;i<topEngagers.length;i++){
                    userIdArr.push(topEngagers[i].id);
                    if((i%50 == 0) || i == (topEngagers.length-1)){
                        batchCount += 1;
                        FB.api('/',{'ids':userIdArr,'fields':'picture,link'}, getProfilePics);
                        userIdArr = [];
                    }
                    
                }
            }
            
        }
            
            FB.api('/'+ pageId +'/feed',{'fields':'likes,comments', 'limit':25}, translateLikesAndComments);
            
            return deferred.promise;
        }
        
        function requestNextPage(nextPage) {
            console.log("requesting next page");
            return $http({
                    method: "get",
                    url: nextPage
                }).then(function(response){return response.data;});
            // raise error if there is no more data
        }
        
        // ---
        // PRIVATE METHODS.
        // ---
        // response has data, status, config, headers

        // I transform the error response, unwrapping the application dta from
        // the API response payload.
        function handleError( error ) {

            return( $q.when(error) );

        }


        // I transform the successful response, unwrapping the application data
        // from the API response payload.
        function handleSuccess( response ) {

        }

}]);
