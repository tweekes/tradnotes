
function PracticeStats(updateUI) {
    this.MAX_ELAPSED = 60000; // 60 seconds
    this.updateUI = updateUI;
    
    this.init = function() {
        this.count = 0;
        this.total = 0;
        this.average = 0;
        this.lastResponseTime = moment(0);
        this.timeOfNext = moment(0);
        this.timeOfAnswer = moment(0);
    }

    this.init();
    
    this.next = function() {

        var lastActivity = (this.timeOfNext.isAfter(this.timeOfAnswer)) ? this.timeOfNext : this.timeOfAnswer;
        this.timeOfNext = moment();
        var lastActivityElapsed = this.timeOfNext.diff(lastActivity,'milliseconds'); 

        if (lastActivityElapsed > this.MAX_ELAPSED) {
            this.init();    
            this.timeOfNext = moment();
        }   

        this.updateStats(); 
    }

    this.answer = function() {
        this.timeOfAnswer = moment();
        this.count++;
        var trialElapsed = this.timeOfAnswer.diff(this.timeOfNext,'milliseconds');
        if (trialElapsed < this.MAX_ELAPSED) {
            this.lastResponseTime = trialElapsed;           
        } else {
            this.init();
        }
        this.updateStats();
    }

    // precision 1 --> 1.1, 2 --> 1.10
    function decimalPrecision(precision,value) {
        var factor = Math.pow(10,precision);
        return parseFloat(Math.round(value * factor ) / factor).toFixed(precision);      
    }

    this.updateStats = function() {
        this.total += this.lastResponseTime;        
        if (this.count > 0) {
            this.average = parseFloat(Math.round(this.total / this.count * 100) / 100).toFixed(2);
        }

        this.updateUI(
                this.count, 
                decimalPrecision(1,this.average / 1000),
                decimalPrecision(1,this.lastResponseTime /1000)
            );
    }

}
