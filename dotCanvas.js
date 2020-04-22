

var mouse={
    x:undefined,
    y:undefined
}

window.addEventListener('mousemove',
function(event){
    mouse.x=event.pageX;
    mouse.y=event.pageY;
    
});




/*
this class draws and handels all functionalities concerned with each circle.
this includes conditional updation. 
*/



class Circle {

    /** 
    * @param x: x-coordinate of the circle
    *
    */
    constructor(x, dx, y, dy, radius, color) {
        this.x = x;
        this.y = y;
        this.dx = dx;//direction and speed of movement along x axis
        this.dy = dy;//direction and speed of movement along y axis
        this.radius = radius;
        // this.red = r;
        // this.green = g;
        // this.blue = b;
        this.color=color;
        
        this.minRadius = 0.2 * radius;//minimum radius is 20% of initial radius
        this.maxRadius = 3 * radius;//maximum radius is 300 % of initial radius
        this.minBrightness=0.11;
        this.maxBrightness=1;
        this.highlightRadius=90

        //any vertex of a hexagon is connected to 3 other vertices 
        //the order is clockwise
        this.adjoiningCircles=[undefined,undefined,undefined];

    }
    setLocation(x,y){
        this.x = x;
        this.y = y;
    }
    getLocation(){
        var location={x:this.x , y:this.y };
        return location;
    }
    draw ()//draws the circle
    { 
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0 * Math.PI / 180, 360 * Math.PI / 180, true);
        ctx.strokeStyle = this.createRgbaString(this.color);
        ctx.stroke();
        //console.log("BRIGHTNESS: "+this.color.brightness);
        ctx.fillStyle=this.createRgbaString(this.color);
        ctx.fill();
    }


    update () //does conditional updations
    {
        //circle movement
        //makes sure circle bounces off the edge
        // if (this.x + this.radius >= innerWidth || this.x - this.radius <= 0) {
        //     this.dx = -1 * this.dx;
        // }
        // if (this.y + this.radius >= innerHeight || this.y - this.radius <= 0) {
        //     this.dy = -1 * this.dy;
        // }
        // this.x += this.dx;
        // this.y += this.dy;


        //interactivity with mouse pointer
        var isTooClose = this.isCircleTooClose(mouse.x, mouse.y, this.x, this.y);
        if (isTooClose && this.color.brightness <= this.maxBrightness) {
            // this.radius=this.increasedRadius;
            this.color.brightness += 0.1;
            //console.log(isTooClose+"  dotx: "+this.x+"  doty: "+this.y+"    mousex: "+mouse.x+"   mousey: "+mouse.y);
        }
        else if (!isTooClose && this.color.brightness > this.minBrightness) {
            this.color.brightness -= 0.05;
        }
        this.draw();
    }

    

    //returns whether the two points are too close(within 50 px) of eachother
    isCircleTooClose(x1,y1,x2,y2){
        // if(Math.abs(x1-x2)<this.highlightRadius && Math.abs(y1-y2)<this.highlightRadius)
        //      return true;
        //  return false;    

        var distance = this.calculateDistance(x1,y1,x2,y2);
        if(distance<this.highlightRadius)
            return true;
        return false;
    
    }

    // convert {r,g,b,b} to rgba string
    createRgbaString(color) {
        return `rgba(${color.red},${color.green},${color.blue},${color.brightness})`;
    }
    calculateDistance(x1,y1,x2,y2){
        return Math.sqrt(((x2-x1)*(x2-x1))+((y2-y1)*(y2-y1)));
    }

    
}


class Line{
    /**
     * 
     * @param {Circle object} startCircle 
     * @param {Circle object} endCircle 
     * @param {int} speed  : unit px moved in 1 frame 
     */
    constructor(startCircle,endCircle,speed,color){

        this.startCircle=startCircle;
        this.endCircle=endCircle;
        this.startPoint=this.startCircle.getLocation();
        this.endPoint=this.endCircle.getLocation();
        this.speed=speed;
        this.drawFrom=this.startCircle.getLocation();
        this.drawTo=this.startCircle.getLocation();
        this.color=color;

    }
    draw ()//draws the line
    {
        console.log("draw")
        ctx.beginPath();
        ctx.moveTo(this.drawFrom.x,this.drawFrom.y);
        ctx.lineTo(this.drawTo.x,this.drawTo.y);
        ctx.strokeStyle = this.createRgbaString(this.color);
        ctx.stroke();
    }
    // convert {r,g,b,b} to rgba string
    createRgbaString(color) {
        return `rgba(${color.red},${color.green},${color.blue},${color.brightness})`;
    }
    update()
    {
        //line will start from starting point and proceed till endpoint 
        //case where line has not reached endpoint yet but is proceeding towards endpoint
        
        
        // console.log("condition1:"+this.arePointsEqual(this.drawFrom,this.startPoint)+"+"+!this.arePointsEqual(this.drawTo,this.endPoint));
        // console.log("condition2:"+this.arePointsEqual(this.drawTo,this.endPoint) +"+"+ !this.arePointsEqual(this.drawFrom,this.endPoint));
        // console.log("condition3:"+this.arePointsEqual(this.drawTo,this.endPoint)+"+"+ this.arePointsEqual(this.drawFrom,this.endPoint));
        
        
        
        if( this.arePointsEqual(this.drawFrom,this.startPoint) && !this.arePointsEqual(this.drawTo,this.endPoint))
        {
            
            var point=this.findPoint(this.drawTo,this.endPoint,this.speed);//returns a point at 'speed' distance from the end of present drawn line towards endpoint
            this.drawTo=point;
        }
        //case when line has reached the endpoint and is receeding from startpoint
        else if(this.arePointsEqual(this.drawTo,this.endPoint)&& !this.arePointsEqual(this.drawFrom,this.endPoint))
        {
            var point=this.findPoint(this.drawFrom,this.endPoint,this.speed);//returns a point at 'speed' distance from the start of present drawn line towards endpoint
            this.drawFrom=point;
        }
        //case when line has receeded to endpoint and has diminished it should choose a new path from endpoint
        else if(this.arePointsEqual(this.drawTo,this.endPoint)&& this.arePointsEqual(this.drawFrom,this.endPoint))
        {
            var indexOfStartCircleFromEndCircle=0 //stores index of startCircle in array adjoiningCircles of endCircle
            for( ;indexOfStartCircleFromEndCircle<this.endCircle.adjoiningCircles.length;indexOfStartCircleFromEndCircle++){
                if (this.endCircle.adjoiningCircles[indexOfStartCircleFromEndCircle]  == this.startCircle )
                    break;
            }

            

            
            var nextPath=0;
            var countUndefined=0
            
            while(true){
                for(var i=0;i<this.endCircle.adjoiningCircles.length;i++){
                    if(this.endCircle.adjoiningCircles[i]==undefined)countUndefined++;
                }
                if (countUndefined>0){
                    nextPath=indexOfStartCircleFromEndCircle;
                    break;
                }
                
                
                nextPath=Math.floor(Math.random()*this.endCircle.adjoiningCircles.length);
                
                if(nextPath==indexOfStartCircleFromEndCircle){
                    nextPath=(nextPath+1)%this.endCircle.adjoiningCircles.length;
                    continue;
                }

                ;


                if(this.endCircle.adjoiningCircles[nextPath]!=undefined)
                    break;//path gets chosen

                nextPath=(nextPath+1)%this.endCircle.adjoiningCircles.length;

                
            }
            
            this.startCircle=this.endCircle;
            this.endCircle=this.endCircle.adjoiningCircles[nextPath];


            this.startPoint=this.startCircle.getLocation();
            this.endPoint=this.endCircle.getLocation();
            this.drawFrom=this.startPoint;
            this.drawTo=this.startPoint;

        }

        this.draw();
        
        
    }


     arePointsEqual(pointA,pointB){
         return pointA.x==pointB.x && pointA.y==pointB.y;
     }
    /**
     * 
     * @param {object} start start of line 
     * @param {object} end  end of line
     * @param {object} distance  distance towards the end
     * 
     * returns a point towards end from start at a given distance 
     */
    findPoint(start,end,distance){
        var slope=(end.y-start.y)/(end.x-start.x);//slope

        var point1={x:undefined,y:undefined};
        var point2={x:undefined,y:undefined};

        point1.x=start.x+distance/Math.sqrt(1+slope*slope);
        point1.y=slope*(point1.x-start.x)+start.y;

        point2.x=start.x-distance/Math.sqrt(1+slope*slope);
        point2.y=slope*(point2.x-start.x)+start.y;

        if(this.isInBetween(start, point1 , end )){
            return point1;
        }
        else if (this.isInBetween(start, point2, end )){
            return point2;
        }
        else{
            var endCopy={x:end.x , y: end.y};
            return endCopy;
        }


    }

    /**
     * 
     * @param {object} start // point1
     * @param {object} point // point to be checked if is in between point1 and point 2
     * @param {object} end // point2
     */
    isInBetween(start, point, end){
        return (this.distance(start,point)+this.distance(point,end) == this.distance(start,end) );
    }

    distance(pointA,pointB){
        return Math.sqrt((pointA.x-pointB.x)*(pointA.x-pointB.x)+(pointA.y-pointB.y)*(pointA.y-pointB.y));
    }

        

}






class Background{
    constructor(canvas,widthOfHexagon){

        this.canvas=canvas;
        this.canvas.width = window.innerWidth;
        this.canvas.height= window.innerHeight;
        this.widthOfHexagon=widthOfHexagon;//(d in explanation)
        this.sideOfHexagon=Math.floor(this.widthOfHexagon/Math.sqrt(3));//(s in explanation)
        this.radius=3;//px
        this.circleArray=[];
        this.colorScheme={red:255,green:255,blue:255,brightness:0.2};
        this.closenessFactor=1.5;
        this.numberOfLines=200;
        this.lineArray=[];
        this.lineSpeed=1//px

        
    }
    initLine(){
       

        for (var i=0;i<this.numberOfLines;i++){
            var startCircle=this.circleArray[Math.ceil(Math.random()*(this.circleArray.length-1))];
            var tempIndex=0;
            
            while(true){
                if(startCircle.adjoiningCircles[tempIndex]!=undefined )break;
                tempIndex++;
            }
            var endCircle=startCircle.adjoiningCircles[tempIndex];
            console.log("start circlr: "+startCircle+" end circle: "+endCircle)
            
            var line=new Line(startCircle,endCircle,this.lineSpeed,this.colorScheme);
            this.lineArray.push(line);
        }
        console.log(this.lineArray);




    }

    initCircle(){
        //initiating the graph whose elements will be stored in circleArray
        var mapWindow=[];//2d array implimentation
        
        //no of dots in x axis
        var xDimAxis=Math.ceil(window.innerWidth /(this.widthOfHexagon)*this.closenessFactor);
        //no of dots in y axis
        var yDimAxis=Math.ceil(window.innerHeight /(this.sideOfHexagon));
        //declaring 2d array od desired dimension with undefined
        for(var i=0;i<yDimAxis;i++){
            mapWindow[i]=[];
            for(var j=0;j<xDimAxis;j++){
                mapWindow[i][j]=undefined;
            }
        }

        
        //calculating no of circles required to fill the screen
        //calculation logic explained separately.
        var noOfRequiredDots= (Math.ceil(xDimAxis/2)*2+Math.floor(xDimAxis/2)*2)*(Math.floor(yDimAxis/4));
        if (yDimAxis % 4==1)
            noOfRequiredDots+=Math.ceil(xDimAxis/2);
        else if(yDimAxis % 4==2)
            noOfRequiredDots+=Math.ceil(xDimAxis/2)*2;
        else if(yDimAxis%4==3)
            noOfRequiredDots+=Math.ceil(xDimAxis/2)*2+Math.floor(xDimAxis/2);
        

        //fill circleArray with calculated number of circles
        this.fillCircleArray(noOfRequiredDots,this.radius,this.colorScheme);
        //console.log(this.circleArray.length);
        mapWindow=this.mapCircleOnWindow(xDimAxis,yDimAxis);
        //console.log(mapWindow);
        this.linkDotsAsGraph(mapWindow);
    }


    linkDotsAsGraph(mapWindow){

        //

        for(var row=0;row<mapWindow.length;row++){
            for(var col=0;col<mapWindow[row].length;col++){

                if(mapWindow[row][col]==undefined)continue;

                //checking for top left
                var adjCol=col-1;
                var adjRow=row-1;
                if(this.isWithinLimits(adjCol,adjRow,mapWindow[0].length,mapWindow.length)&&mapWindow[adjRow][adjCol]!=undefined ){
                    mapWindow[row][col].adjoiningCircles[0]=mapWindow[adjRow][adjCol];
                }
                //checking top
                adjCol=col;
                adjRow=row-1;
                if(this.isWithinLimits(adjCol,adjRow,mapWindow[0].length,mapWindow.length)&&mapWindow[adjRow][adjCol]!=undefined ){
                    mapWindow[row][col].adjoiningCircles[0]=mapWindow[adjRow][adjCol];
                }
                //checking top right 
                adjCol=col+1;
                adjRow=row-1;
                if(this.isWithinLimits(adjCol,adjRow,mapWindow[0].length,mapWindow.length)&&mapWindow[adjRow][adjCol]!=undefined ){
                    mapWindow[row][col].adjoiningCircles[1]=mapWindow[adjRow][adjCol];
                }
                //checking bottom right
                adjCol=col+1;
                adjRow=row+1;
                if(this.isWithinLimits(adjCol,adjRow,mapWindow[0].length,mapWindow.length)&&mapWindow[adjRow][adjCol]!=undefined ){
                    mapWindow[row][col].adjoiningCircles[1]=mapWindow[adjRow][adjCol];
                }
                //checking bottom
                adjCol=col;
                adjRow=row+1;
                if(this.isWithinLimits(adjCol,adjRow,mapWindow[0].length,mapWindow.length)&&mapWindow[adjRow][adjCol]!=undefined ){
                    mapWindow[row][col].adjoiningCircles[2]=mapWindow[adjRow][adjCol];
                }
                //checking bottom left
                adjCol=col-1;
                adjRow=row+1;
                if(this.isWithinLimits(adjCol,adjRow,mapWindow[0].length,mapWindow.length)&&mapWindow[adjRow][adjCol]!=undefined ){
                    mapWindow[row][col].adjoiningCircles[2]=mapWindow[adjRow][adjCol];
                }
            }
        }

    }

    /**
     * @param x : given x coordinate
     * @param y : given y coordinate
     * @param xAxis : length of x axis
     * @param yAxis : length of y axis
     */
    isWithinLimits(x,y,xAxis,yAxis){
        return(0<=x && x<xAxis  && 0<=y && y<yAxis) 
    }


    fillCircleArray(noOfRequiredDots,radius,colorScheme){
        for(var i=0;i<noOfRequiredDots;i++){
            this.circleArray.push(new Circle(radius,0,radius,0,radius,colorScheme))// initially all the circles are located at the top right corner of the screen.
        }
    }

    /**
     * @param xDimAxis : the x axis length on window
     * @param yDimAxis : the y axis length on window 
     */
    mapCircleOnWindow(xDimAxis,yDimAxis){
        
        //initiating the graph whose elements will be stored in circleArray
        var mapWindow=[];//2d array implimentation
        
        
        //declaring 2d array od desired dimension with undefined
        for(var i=0;i<yDimAxis;i++){
            mapWindow[i]=[];
            for(var j=0;j<xDimAxis;j++){
                mapWindow[i][j]=undefined;
            }
        }
    

        /**
         *          the following map will be drawn in the matrix and 
         *          (x,y) coordinates will be assigned accordingly
         *          *- the circle(dot) on screen
         *          .-space in the matrix
         * 
         *          * . * . * . * . * . * . * . * .             #0
         *          * . * . * . * . * . * . * . * .             #1
         *          . * . * . * . * . * . * . * . *             #2
         *          . * . * . * . * . * . * . * . *             #3
         *          * . * . * . * . * . * . * . * .             #0
         *          * . * . * . * . * . * . * . * .             #1
         *            *   *   *   *   *   *   *   *             #2
         *            *   *   *   *   *   *   *   *             #3
         *          *   *   *   *   *   *   *   *               #0
         *          *   *   *   *   *   *   *   *               #1
         *            *   *   *   *   *   *   *   *             #2
         *            *   *   *   *   *   *   *   *             #3
         
        */

        var indexCircleArray=0; 
        var repeatAfter=4;//pattern repeat as described above
        
        //filling up the 2d array 
        for (var row=0;row<yDimAxis;row+=repeatAfter){
            for (col=0;col<xDimAxis;col+=2){
                if(row<yDimAxis){  // checking for last set of 4 (particular condition is redundant given for uniformity)
                    mapWindow[row][col]=this.circleArray[indexCircleArray++];   // filling #0
                }
                if(row+1<yDimAxis){// checking for last set of 4  
                    mapWindow[row+1][col]=this.circleArray[indexCircleArray++]; // filling #1
                }
            }
            for (col=1;col<xDimAxis;col+=2){
                if(row+2<yDimAxis){// checking for last set of 4
                    mapWindow[row+2][col]=this.circleArray[indexCircleArray++]; // filling #2
                }
                if(row+3<yDimAxis){// checking for last set of 4
                    mapWindow[row+3][col]=this.circleArray[indexCircleArray++]; // filling #3
                }
            }
        }
        

        //relation of x,y with row and col of mapWindow[][] 
        for(var row=0;row<yDimAxis;row++){
            for(var col=0;col<xDimAxis;col++){
                if(mapWindow[row][col]!=undefined){
                    mapWindow[row][col].x=this.widthOfHexagon*col/this.closenessFactor;
                    mapWindow[row][col].y=this.sideOfHexagon*row;
                }
            }
        }

        return mapWindow
    }

        
    

}


var canvas=document.getElementById('canvas');
var ctx=canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height= window.innerHeight;
var widthOfHexagon=50;//px
var background=new Background(canvas,widthOfHexagon)
background.initCircle();

background.initLine();

function animate(){
    
    requestAnimationFrame(animate);
    ctx.clearRect(0,0,innerWidth,innerHeight);
    for(var i=0;i<background.circleArray.length;i++){
        background.circleArray[i].update();
    }
    for(var i=0;i<background.lineArray.length;i++){
        console.log("iteration : "+i);
        background.lineArray[i].update();
    }

}

animate();




