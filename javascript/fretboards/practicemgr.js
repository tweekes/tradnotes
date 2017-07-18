function PracticeManager() { 
    this.currentTuning;
    this.fbData;
    this.availableStrings = []; // for six strings, e.g. would be: [1,2,3,4,5,6]
    this.currentAction = 0; // 0 = next question and 1 = answer;

    this.setTuning = function(tuning,numberOfFrets) {
        this.availableStrings = [];
        this.currentTuning = tuning;
        var withSharps = true;
        this.fbData = fbGenerate(this.currentTuning.strings, numberOfFrets, withSharps);
        for (var i = 1; i <=this.currentTuning.strings.length; i++ ) {
            this.availableStrings.push(i);
        }
    }

    this.currentActionToggle = function() {
        this.currentAction = 1 - this.currentAction; 
    }

    this.getRandomFretBoardPosition = function() {
        var availableFrets = this.currentTuning.significantFrets;
        var result =  {fretNumber:availableFrets[_.random(0, availableFrets.length-1)], 
                stringNumber:this.availableStrings[_.random(0,this.availableStrings.length-1)] 
               };
        return result;       
    }

    this.fretBoardNoteAt = function(fretBoardNumber, stringNumber) {
        return this.fbData[this.currentTuning.strings.length - stringNumber][fretBoardNumber][0];
    }

    this.getFretBoardPositionsForNote = function(note) {
        var result = [];
        var stringNumber = 0;
        _.each(this.fbData,function(string){
            var fretPosition = 0;
            _.each(string,function(n){
                if (n[0] == note) {
                    result.push(
                         {
                            fretNumber:fretPosition,
                            stringNumber:stringNumber
                         }   
                    )
                }
                fretPosition++;
            });  
            stringNumber++;  
        })
        return result;
    }
}