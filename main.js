const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 200;
const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 300;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);
const N = 200;
const cars = generateCars(N);
let bestCar = cars[0];
if (localStorage.getItem("bestBrain")) {
    console.log(localStorage.getItem("bestBrain"));
    for (let i = 0; i < cars.length; i++) {
        cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
        if (i != 0) {
            NeuralNetwork.mutate(cars[i].brain, 0.1);
        }
    }
}
// passes hard coded traffic
// bestCar.brain = JSON.parse("{\"levels\":[{\"inputs\":[0.18854692973474152,0,0,0.12834232959047298,0.5489017827257705],\"outputs\":[1,0,1,1,0,1],\"biases\":[-0.025209003553100455,0.002977519017550709,-0.20857809207097666,-0.020801366710332475,0.19912841531962272,-0.013211761863638746],\"weights\":[[0.2602726927646615,0.15742831851270805,0.22421817175937767,0.20517381917780114,-0.09460916413915446,-0.05464387350530488],[0.13735938325102165,-0.2302484781380824,-0.09359278897251821,-0.08216673055547906,-0.00497252578816855,-0.07323324194225257],[-0.20469056154773393,-0.05494102654723074,-0.14182829321542548,0.09710039969524256,0.11634584227861684,-0.15173987064131372],[-0.07232115522613058,0.11768873575952021,-0.20315753473724324,0.09966120086440018,0.15874764235304745,-0.13205497905725505],[-0.013706138148074323,-0.13475664748775595,-0.14843331842899687,0.003240463855187628,0.32686885868985416,0.18265915559078869]]},{\"inputs\":[1,0,1,1,0,1],\"outputs\":[0,0,1,0],\"biases\":[-0.10988010448366117,-0.1577676259749659,-0.12069606166967475,-0.009639799825110831],\"weights\":[[-0.09623176374695047,-0.051861969811736575,0.07312967598078789,-0.018817259199557623],[-0.02193216256529986,-0.10322859140061551,-0.06526073224497142,0.2352423411021912],[-0.08045650683710409,0.04664987716996202,-0.09340299173717433,-0.06852440288638874],[0.04013357277794363,-0.05110136443185169,-0.057594701324135064,-0.10627299355975456],[0.012003720991588626,0.29009653073854463,-0.20563412995855296,-0.0896342371265912],[-0.018871867362495135,-0.18401262872365035,0.0679737755185978,0.024883968986443572]]}]}")
const traffic = [
    new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(0), -300, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(2), -300, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(0), -500, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(1), -500, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(1), -700, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(2), -700, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(1), -900, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(2), -900, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(0), -1100, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(2), -1100, 30, 50, "DUMMY", 2)
];
// for (let i = 1; i < 50; i++) {
//     traffic.push(new Car(road.getLaneCenter(Math.floor(Math.random() * 3)), -200 * i, 30, 50, "DUMMY", 2),)
//     traffic.push(new Car(road.getLaneCenter(Math.floor(Math.random() * 3)), -200 * i, 30, 50, "DUMMY", 2),)
// }
animate();

function save() {
    localStorage.setItem("bestBrain", 
        JSON.stringify(bestCar.brain));
}

function discard() {
    localStorage.removeItem("bestBrain");
}

function generateCars(N) {
    const cars = [];
    for (let i = 1; i <= N; i++) {
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI"));
    }
    return cars;
}

function animate(time) {
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].update(road.borders, []);
    }
    for (let i = 0; i < cars.length; i++) {
        cars[i].update(road.borders, traffic);
    }
    bestCar = cars.find(
        c=>c.y == Math.min(
            ...cars.map(c=>c.y)
        )
    );
    
    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;
    carCtx.save();
    carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7);
    road.draw(carCtx);
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].draw(carCtx, "red");
    }
    carCtx.globalAlpha = 0.2;
    for (let i = 0; i < cars.length; i++) {
        cars[i].draw(carCtx, "blue");
    }
    carCtx.globalAlpha = 1;
    bestCar.draw(carCtx, "blue", true);
    carCtx.restore();
    networkCtx.lineDashOffset = -time / 50;
    Visualizer.drawNetwork(networkCtx, bestCar.brain);
    requestAnimationFrame(animate);
    done = true;
    for (let i = 0; i < cars.length; i++) {
        if (!cars[i].damaged) {
            done = false;
        }
    }
    if (done) {
        console.log("hi")
        save();
        history.go(0)
    }
}
