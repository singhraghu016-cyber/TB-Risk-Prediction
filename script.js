let patientCount = 0;
let history = [];


// ------------------------------------
// RISK COLORS
// ------------------------------------

const riskColors = {

    Low: {
        bg: '#E8F5E9',
        border: '#2E7D32',
        text: '#2E7D32',
        bar: '#4CAF50'
    },

    Moderate: {
        bg: '#FFF8E1',
        border: '#F57F17',
        text: '#E65100',
        bar: '#FFC107'
    },

    High: {
        bg: '#FFF3E0',
        border: '#E65100',
        text: '#BF360C',
        bar: '#FF5722'
    },

    'Very High': {
        bg: '#FFEBEE',
        border: '#C0392B',
        text: '#B71C1C',
        bar: '#F44336'
    }

};


// ------------------------------------
// RISK DESCRIPTIONS
// ------------------------------------

const riskDescriptions = {

    Low:
        'This patient shows minimal risk factors for TB. Routine annual screening is recommended. Educate on TB symptoms to watch for.',

    Moderate:
        'Moderate risk detected. Consider NAAT/sputum test if symptoms persist. Schedule follow-up within 3 months.',

    High:
        'High TB risk identified. Immediate clinical evaluation, sputum test, and NAAT recommended. Prioritize for intensive screening.',

    'Very High':
        'Very high TB risk. Urgent clinical assessment required. Diagnostic workup should be arranged immediately.'
};


// ------------------------------------
// RECOMMENDATIONS
// ------------------------------------

const riskRecs = {

    Low: [

        'Schedule routine annual TB screening',

        'Educate patient on TB symptoms',

        'Advise patient to report symptoms if they develop',

        'Promote household ventilation and hygiene'

    ],

    Moderate: [

        'Conduct NAAT/sputum test if cough is present',

        'Schedule follow-up within 3 months',

        'Counsel on alcohol/smoking cessation if applicable',

        'Screen household contacts'

    ],

    High: [

        'Prioritize clinical evaluation',

        'Consider NAAT and X-ray',

        'Collect sputum sample when clinically indicated',

        'Conduct household contact screening',

        'Refer to an appropriate TB care facility'

    ],

    'Very High': [

        'Immediate clinical examination required',

        'Arrange diagnostic workup promptly',

        'Consider NAAT, X-ray and sputum testing',

        'Take appropriate infection-control precautions',

        'Refer to a TB care facility'
    ]

};


// ------------------------------------
// MAIN CALCULATION
// ------------------------------------

function calculate() {

    const age =
        parseInt(
            document.getElementById('age').value
        ) || 0;

    const gender =
        document.getElementById('gender').value;

    const tribal =
        document.getElementById('tribal').value;

    const cough =
        document.getElementById('cough').value;

    const chest =
        document.getElementById('chest').value;

    const xray =
        document.getElementById('xray').value;

    const alcohol =
        document.getElementById('alcohol').value;

    const smoking =
        document.getElementById('smoking').value;

    const weightloss =
        document.getElementById('weightloss').value;

    const fever =
        document.getElementById('fever').value;


    // --------------------------------
    // SCORE CALCULATION
    // --------------------------------

    let sAge = 0;

    if (age >= 46 && age <= 60) {

        sAge = 2;

    } else if (age > 60) {

        sAge = 1;

    } else {

        sAge = 0;

    }


    const sTribal =
        tribal === 'tribal' ? 2 : 0;

    const sCough =
        cough === 'yes' ? 2 : 0;

    const sXray =
        xray === 'suggestive' ? 2 : 0;

    const sChest =
        chest === 'yes' ? 1 : 0;

    const sAlcohol =
        alcohol === 'yes' ? 1 : 0;

    const sGender =
        gender === 'male' ? 1 : 0;

    const sWt =
        weightloss === 'yes' ? 1 : 0;


    // Total score

    const total =
        sAge +
        sTribal +
        sCough +
        sXray +
        sChest +
        sAlcohol +
        sGender +
        sWt;


    // --------------------------------
    // RISK LEVEL
    // --------------------------------

    let level = 'Low';

    if (total >= 8) {

        level = 'Very High';

    } else if (total >= 6) {

        level = 'High';

    } else if (total >= 3) {

        level = 'Moderate';

    }


    // --------------------------------
    // APPROXIMATE PROBABILITY
    // --------------------------------

    const logit =
        -5.2
        + (0.013 * age)
        + (0.21 * sTribal / 2)
        + (0.51 * sGender)
        + (1.25 * sCough / 2)
        + (0.72 * sChest)
        + (0.40 * sXray / 2)
        + (0.21 * sAlcohol)
        + (0.17 * (smoking === 'yes' ? 1 : 0))
        - (1.02 * sWt);


    const probability =
        1 / (1 + Math.exp(-logit));


    const probabilityPercent =
        Math.min(
            Math.max(probability * 100, 1),
            95
        ).toFixed(1);


    // --------------------------------
    // UPDATE UI
    // --------------------------------

    const rc = riskColors[level];


    const scoreCircle =
        document.getElementById('scoreCircle');


    scoreCircle.style.background =
        rc.bg;

    scoreCircle.style.borderColor =
        rc.border;

    scoreCircle.style.color =
        rc.text;


    document.getElementById('scoreNum')
        .textContent = total;


    document.getElementById('riskLabel')
        .textContent = level + ' Risk';


    document.getElementById('riskLabel')
        .style.color = rc.text;


    document.getElementById('riskDesc')
        .textContent =
        riskDescriptions[level];


    // --------------------------------
    // PROBABILITY
    // --------------------------------

    const probText =
        document.getElementById('probText');


    probText.textContent =
        probabilityPercent + '% probability';


    probText.style.color =
        rc.text;


    const riskBar =
        document.getElementById('riskBar');


    riskBar.style.width =
        Math.min(
            probabilityPercent * 1.5,
            100
        ) + '%';


    riskBar.style.background =
        rc.bar;


    // --------------------------------
    // FACTOR BREAKDOWN
    // --------------------------------

    const points = {

        age: sAge,

        tribal: sTribal,

        cough: sCough,

        xray: sXray,

        chest: sChest,

        alcohol: sAlcohol,

        gender: sGender,

        wt: sWt

    };


    for (
        const [key, value]
        of Object.entries(points)
    ) {

        const pointsElement =
            document.getElementById(
                'pts-' + key
            );


        const box =
            document.getElementById(
                'f-' + key
            );


        if (pointsElement) {

            pointsElement.textContent =
                '+' + value;

        }


        if (box) {

            box.style.opacity =
                value > 0 ? '1' : '0.4';


            box.classList.toggle(
                'active',
                value > 0
            );

        }

    }


    // --------------------------------
    // RECOMMENDATION
    // --------------------------------

    const recPanel =
        document.getElementById(
            'recPanel'
        );


    recPanel.style.display =
        'block';


    recPanel.style.background =
        rc.bg;


    recPanel.style.border =
        '1.5px solid ' + rc.border;


    const recTitle =
        document.getElementById(
            'recTitle'
        );


    recTitle.textContent =
        '📋 Recommended Action — ' +
        level +
        ' Risk Patient';


    recTitle.style.color =
        rc.text;


    const recList =
        document.getElementById(
            'recList'
        );


    recList.innerHTML =
        riskRecs[level]
            .map(item => `<li>${item}</li>`)
            .join('');


    // --------------------------------
    // SHOW RESULT
    // --------------------------------

    document.getElementById(
        'resultPanel'
    ).style.display = 'block';


    document.getElementById(
        'saveBtn'
    ).style.display = 'inline-flex';


    // --------------------------------
    // SAVE CURRENT PATIENT
    // --------------------------------

    window._current = {

        age,
        gender,
        tribal,
        cough,
        xray,
        total,
        level

    };

}


// ------------------------------------
// RESET FORM
// ------------------------------------

function resetForm() {

    const fields = [

        'age',
        'gender',
        'tribal',
        'cough',
        'chest',
        'xray',
        'alcohol',
        'smoking',
        'weightloss',
        'fever'

    ];


    fields.forEach(id => {

        const element =
            document.getElementById(id);


        element.value = '';

    });


    document.getElementById(
        'resultPanel'
    ).style.display = 'none';


    document.getElementById(
        'saveBtn'
    ).style.display = 'none';


    window._current = null;

}


// ------------------------------------
// SAVE PATIENT
// ------------------------------------

function saveToHistory() {

    if (!window._current) {
        return;
    }


    const patient =
        window._current;


    patientCount++;


    history.push(patient);


    const rc =
        riskColors[patient.level];


    const tbody =
        document.getElementById(
            'historyBody'
        );


    const row =
        document.createElement('tr');


    row.innerHTML = `

        <td>${patientCount}</td>

        <td>${patient.age || '—'}</td>

        <td>${patient.gender || '—'}</td>

        <td>${patient.tribal || '—'}</td>

        <td>${patient.cough || '—'}</td>

        <td>${patient.xray || '—'}</td>

        <td>
            <strong>
                ${patient.total}/12
            </strong>
        </td>

        <td>
            <span
                class="risk-chip"
                style="
                    background:${rc.bg};
                    color:${rc.text};
                "
            >
                ${patient.level}
            </span>
        </td>

        <td
            style="
                font-size:10px;
                color:#C0392B;
                cursor:pointer;
            "
            onclick="this.parentElement.remove()"
        >
            ✕ Remove
        </td>

    `;


    tbody.appendChild(row);


    document.getElementById(
        'historyPanel'
    ).style.display = 'block';


    const saveButton =
        document.getElementById(
            'saveBtn'
        );


    saveButton.textContent =
        '✅ Saved!';


    setTimeout(() => {

        saveButton.textContent =
            '💾 Save Patient';

    }, 1500);

}