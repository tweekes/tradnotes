function AvailableTunings(){
    this.data = [
        // selected is used when populating the drop down list. significantFrets is with the practice screens. 
        // only question positions in those frets.
        {label:"Guitar DADGAD",strings:["D","A","D","G","A","D"],selected:true,significantFrets:[2,3,4,5,7,9,10]},
        {label:"Guitar DADGBD",strings:["D","A","D","G","B","D"],selected:false,significantFrets:[2,3,4,5,7,9,10]},
        {label:"Guitar DADGBE",strings:["D","A","D","G","B","E"],selected:false,significantFrets:[2,3,4,5,7,9,10]},
        {label:"Guitar EADGBE",strings:["E","A","D","G","B","E"],selected:false,significantFrets:[2,3,4,5,7,9,10]},
        {label:"Guitar DGDGBD",strings:["D","G","D","G","B","D"],selected:false,significantFrets:[2,3,4,5,7,9,10]},
        {label:"Mandolin GDAE",strings:["G","D","A","E"],selected:false,significantFrets:[2,3,5,7,9,10]}
    ];

    this.init = function(){
        var self = this;
        var sel = document.getElementById('tuning');
        for(var i = 0; i < self.data.length; i++) {
            var opt = document.createElement('option');
            opt.innerHTML = self.data[i].label;
            opt.value = i;
            opt.selected=self.data[i].selected;
            sel.appendChild(opt);
        }
    }

    this.getSelectedIndex = function() {
        var e = document.getElementById("tuning");
        return e.selectedIndex;
    }
    this.getData = function(index){
        var self = this;
        return self.data[index];
    }

    this.getSelected = function() {
        return this.getData(this.getSelectedIndex());
    }
}