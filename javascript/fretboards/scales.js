// var _  = require('../vendor/underscore.js'); 

var  notes = [["A"],["A#","Bb"],["B"],["C"],["C#","Db"],["D"],["D#","Eb"],["E"],["F","x","E#"],["F#","Gb"],["G"],["G#","Ab"]];
var scaleInfo = new ScaleInfo([
    {k:["A"],sharps:true},
    {k:["A#","Bb"],sharps:false},
    {k:["B"],sharps:true},
    {k:["C"],sharps:true},
    {k:["C#","Db"],sharps:false},
    {k:["D"],sharps:true},
    {k:["D#","Eb"],sharps:false},
    {k:["E"],sharps:true},
    {k:["F"],sharps:false},
    {k:["F#","Gb"],sharps:true},
    {k:["G"],sharps:true},
    {k:["G#","Ab"],sharps:false}
]);

function ScaleInfo(data) {
    this.notes = [];
    this.values = [];
    this.map = {};
    var self = this;

    this.put = function(keys,info) {
        self.values.push(info);
        _.each(keys,function(k) {
            self.map[k] = self.values.length-1;
        });
    };

    this.load = function(data) {       
        _.each(data,function(d){
            self.notes.push(d.k);
            self.put(d.k,d.sharps);
        });
    }
    this.load(data);
    
    this.get = function(rootNote) {
        return self.values[self.map[rootNote]];
    }

    // Normalize a root note, e.g. returns Eb for D#.  
    this.normalizeRootNote = function(rootNote) {
         var withSharps = self.get(rootNote);
         var i = (withSharps) ? 0 : 1;
         for (var j = 0; j < self.notes.length;j++) {            
            if (self.notes[j].length == 2) {
                if (self.notes[j][0] == rootNote || self.notes[j][1] == rootNote) {
                    return self.notes[j][i]; 
                }
            } 
         }
         return(rootNote);
    }
}

function getNotePos(note) {
    var pos = 0;
    while(pos < 12) {
       if (notes[pos][0]==note || (notes[pos].length == 2 && notes[pos][1]=== note)) {
           return pos;
       }
       pos++;
    }
    console.log("Error: Bad note");
}

// In this function we care a lot about the correct key spelling for the scale that's being rendered.
// e.g. In the key of "A" you use C# not Db because D is used. 
// var majorScaleFormula = [0,2,4,5,7,9,11,12];
function getReversePos(scaleFormula,scalePos,rootNote,noteIdx) {
    // Is the note position a black note?
    if (notes[noteIdx].length == 2) {

        // Horrible special case for f# major scale.
        if (rootNote[0] == "F#" && scaleFormula[scalePos] == 12) {
            return "F#";
        } else if (scalePos > 0 && scaleFormula[scalePos] - scaleFormula[scalePos-1] == 1) {
            return notes[noteIdx][1];
        } if (scalePos < scaleFormula.length - 1 && scaleFormula[scalePos+1] - scaleFormula[scalePos] == 1) {           
           // e.g. in scale of A, D is used at the 4th position at the 3rd C# must be used and not Db.  
            return notes[noteIdx][0];
        } else {
            var withSharps = scaleInfo.get(rootNote[0]);
            var i = (withSharps) ? 0 : 1;            
            return notes[noteIdx][i];
        } 
    } else {
        var note = notes[noteIdx][0];
        // This is a, horrible, special case for scale of f#
        if (note == "F" && scaleFormula[scalePos] == 11) {
            note = "E#";
        } 
        return note;
    }
}

// This function is only used when building the fretboard data.
function getReversePosScaleNutral(withSharps,idx) {
    var n = [];
    if (notes[idx].length == 2 && !withSharps) {
        n.push(notes[idx][1]);
        n.push(notes[idx][0]);
    } else if (notes[idx].length == 2 && withSharps) {
        n.push(notes[idx][0]);
        n.push(notes[idx][1]);
    } else {
        n.push(notes[idx][0]);
    }
    return n;
}

function fbGenerate(strings,numberOf_Frets,withSharps) { 
    var fretBoardData = [];
    _.each(strings,function(stringNote){ 
        var s = []; 
        var currentNote = []; currentNote.push(stringNote);        
        _(numberOf_Frets).times(function(i){ 
            s.push(currentNote); 
            currentNote = nextNote(withSharps,currentNote); 
        }); 
        fretBoardData.push(s); 
    }); 

    return fretBoardData;
} 

function nextNote(withSharps,note) { 
    var np = getNotePos(note[0]); 
    if (np === 11) { 
        np = 0; 
    } else { 
        np++; 
    } 
    return getReversePosScaleNutral(withSharps,np); 
} 

function noteInScale(rootNote, scaleFormula, scalePos ) { 
    var np = getNotePos(rootNote[0]) + scaleFormula[scalePos]; 

    if (np > 11) { 
        np-=12; 
    }     

    return getReversePos(scaleFormula,scalePos,rootNote,np); 
} 

function getFretBoardPositionsForScale(rootString, rootFret,scaleFormula,strings) { 
    var fretBoardPosistions = []; 
    var scalePos = 0; 
    var currentString = rootString; 
    var currentFret = rootFret; 
    var rootNote =  scaleInfo.normalizeRootNote(strings[currentString][currentFret][0]);     
    var rootFbPos = {s:currentString,f:currentFret,n:rootNote};
    fretBoardPosistions.push(rootFbPos);
    var i = 0;
    var fBPosition = null;
    var firstRootPosition = rootFbPos;
    var lastFbPosition = rootFbPos;
    while (true) {  
        scalePos++; 
        if (scalePos == scaleFormula.length) {
            scalePos = 1; 
            rootFbPos = fBPosition;
        }
                
        fBPosition = fretPositionForNote(rootFbPos,lastFbPosition,firstRootPosition,scaleFormula,scalePos,strings); 
        if (fBPosition !== null) {
            fretBoardPosistions.push(fBPosition);
            lastFbPosition = fBPosition;
           // console.log("Root: " + toStringFbPosition(rootFbPos) + " Current: " + toStringFbPosition(fBPosition));
        } else {
            break;
        }
        i++;
    }
    return fretBoardPosistions;
} 

function fretPositionForNote(rootFbPosition,lastFbPosition,firstRootPos, scaleFormula,scalePos,strings) {
    var maxStringIdx = strings.length -1;
    var rootString = rootFbPosition.s;
    var rootFret = firstRootPos.f;
    var rootNote = strings[rootFbPosition.s][rootFbPosition.f];
    var targetNote = noteInScale(rootNote, scaleFormula, scalePos );
    var numberOfStrings = strings.length;
    var numberOf_Frets = strings[0].length;
    var candidates = [];

    var fretNumber = null;
    var stringIdx = lastFbPosition.s; 
    var count = 1;

       if (targetNote === "G#") { // Debugging only
           var dummy = null;
       }

    while (stringIdx < numberOfStrings && count <= 4) {



        if ( (fretNumber = findNotePosOnString(strings[stringIdx],stringIdx,firstRootPos,targetNote)) != null) {
            // Fudge calculation for distance. Distances is used to decide which next note/fret position is used, current string or next.
            var distance = ((stringIdx - rootString) * 1.8) + fretNumber - rootFret;

            if(stringIdx < maxStringIdx ||                
                (stringIdx == maxStringIdx && (fretNumber - rootFret) <= 5)) {
                    candidates.push({s:stringIdx,f:fretNumber,n:targetNote,distance:distance});
            }
        }    
        stringIdx++;count++;
    }

    // Now find the candidate with the minimum distance.

    var fretPosition = null;

    if (targetNote === "G#") { // Debugging only
        var dummy = null;
    }

    _.each(candidates,function(candidate){
        if (fretPosition == null) {
            fretPosition = candidate;
        } else {
            if (candidate.distance < fretPosition.distance) {
                fretPosition = candidate;
            }
        }
    });

    return fretPosition;
}


function findNotePosOnString(string,stringIdx,startFbPosition,note) {
    var fretPosition = null;
    var searchNote = note;

    if (string) {
        // var i = (startFbPosition.f > 0) ? startFbPosition.f -1 : 0;
        var i = startFbPosition.f;

        // We need to handle the very special case the note == 'E#', this occurs in F# scale

        if (note =="E#") {
            searchNote = "F";
        }

        while(i < string.length) {
            if ((string[i][0] == searchNote || (string[i].length == 2 && string[i][1] == searchNote))
                 && !(i==startFbPosition.f && startFbPosition.s== stringIdx)) { // Cond excludes the same position as he root position.
                return i;
            }
            i++;
        }
    }

    return fretPosition
}

function toStringFbPosition(fBPosition) {
    return " Strg: " + fBPosition.s + " Fret: " + fBPosition.f + "  Note: " + fBPosition.n;
}


// function fretPositionForNote(rootFbPosition,scaleFormula,scalePos,numberOf_Frets,strings)

function runLocal() {
    var withSharps = false;
    var fbData = fbGenerate(["D","A","D","G","A","D"],20,withSharps); 
    var majorScaleFormula = [0,2,4,5,7,9,11,12]; 
    var result = getFretBoardPositionsForScale(4, 5,majorScaleFormula,fbData); // 5,1
    // console.log (result);
}

// runLocal();

fd = 
[ 
      // 00    01   02    03   04    05   06   07    08   09   10    11    12   13   14   15    16   17    18   19    20 
        ["D", "D#", "E", "F", "F#", "G", "Ab", "A", "Bb", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "Ab", "A", "Bb" ], 
        ["A", "Bb", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "Ab", "A", "Bb", "B", "C", "C#", "D", "D#", "E", "F"  ], 
        ["D", "D#", "E", "F", "F#", "G", "Ab", "A", "Bb", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "Ab", "A", "Bb" ], 
        ["G", "Ab", "A", "Bb", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "Ab", "A", "Bb", "B",  "C", "C#", "D", "D#" ], 
        ["A", "Bb", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "Ab", "A", "Bb", "B", "C", "C#", "D", "D#", "E", "F"  ], 
        ["D", "D#", "E", "F", "F#", "G", "Ab", "A", "Bb", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "Ab", "A", "Bb" ] 
] 














