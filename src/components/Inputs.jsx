import { useState, useRef, useEffect } from 'react'
import '../assets/style/App.css'
import infoIcon from '../assets/icons/info.svg';
import moneyIcon from '../assets/icons/money.svg';
import percentIcon from '../assets/icons/percent.svg';
import calendarIcon from '../assets/icons/calendar.svg';
import clockIcon from '../assets/icons/clock.svg';
import selectArrow from '../assets/icons/select-arrow.svg';

export default function Inputs() {
    // Estados "raw": guardan los valores numéricos sin formato
    // (solo dígitos y punto). Usamos estos para cálculos y para
    // evitar problemas del caret cuando formateamos la visualización.
    const [depositRaw, setDepositRaw] = useState('');
    const [rateRaw, setRateRaw] = useState('');
    const [yearsRaw, setYearsRaw] = useState('');
    const [contribRaw, setContribRaw] = useState('');

    // Flags de foco: cuando un campo está enfocado mostramos el valor
    // sin formato (raw) para permitir edición natural; al blur mostramos
    // la versión formateada (con $ / % / "años").
    const [depositFocused, setDepositFocused] = useState(false);
    const [rateFocused, setRateFocused] = useState(false);
    const [yearsFocused, setYearsFocused] = useState(false);
    const [contribFocused, setContribFocused] = useState(false);

    // Helpers de formato / parseo
    // numberFormatter: usa 'en-US' para mostrar separador de miles con comas
    const numberFormatter = new Intl.NumberFormat('en-US');

    // unformatNumber: elimina todo lo que no sea dígito o punto
    // Resultado: cadena adecuada para Number(raw)
    function unformatNumber(str) {
        if (!str) return '';
        return String(str).replace(/[^0-9.]/g, '');
    }

    // formatCurrency: formatea un raw numérico a cadena con prefijo $ y comas
    // Ej: '1000' -> '$1,000'
    function formatCurrency(raw) {
        if (!raw) return '';
        const n = Number(raw);
        if (Number.isNaN(n)) return '';
        return '$' + numberFormatter.format(n);
    }

    // formatPercent: añade el sufijo '%' al número (ej: '10' -> '10%')
    function formatPercent(raw) {
        if (!raw) return '';
        const n = Number(raw);
        if (Number.isNaN(n)) return '';
        return (Number.isInteger(n) ? String(n) : String(n)) + '%';
    }

    // formatYears: añade "año" o "años" según el número
    function formatYears(raw) {
        if (!raw) return '';
        const n = Number(raw);
        if (Number.isNaN(n)) return '';
        return n === 1 ? `${n} año` : `${n} años`;
    }

    function CustomSelect() {
        const options = [
            { value: 'anualmente', label: 'Anualmente' },
            { value: 'mensualmente', label: 'Mensualmente' },
            { value: 'quincenalmente', label: 'Quincenalmente' },
            { value: 'semanalmente', label: 'Semanalmente' },
            { value: 'diariamente', label: 'Diariamente' }
        ];

        // Estado local del select: "open" controla si la lista está desplegada.
        // "selected" guarda la opción actual mostrada en el trigger.
        const [open, setOpen] = useState(false);
        const [selected, setSelected] = useState(options[0]);
        const ref = useRef(null);

        // useEffect: escucha clicks fuera del componente para cerrar el desplegable.
        // Esto evita que la lista quede abierta si el usuario clickea en otra parte.
        useEffect(() => {
            function onDocClick(e) {
                if (ref.current && !ref.current.contains(e.target)) setOpen(false);
            }
            document.addEventListener('click', onDocClick);
            return () => document.removeEventListener('click', onDocClick);
        }, []);

        // Precompute elements to avoid inline logic inside JSX
        const triggerClass = `cs-trigger ${open ? 'open' : ''}`;
        const optionsElements = options.map(opt => (
            <li key={opt.value} className="cs-option" onClick={() => { setSelected(opt); setOpen(false); }}>{opt.label}</li>
        ));
        const optionsDropdown = open ? (
            <ul className="cs-options">
                {optionsElements}
            </ul>
        ) : null;

        return (
            <div className="custom-select" ref={ref}>
                {/* Trigger: muestra la opción seleccionada y abre/cierra la lista al click */}
                <button type="button" className={triggerClass} onClick={() => setOpen(v => !v)}>
                    <span>{selected.label}</span>
                    <img src={selectArrow} alt="arrow" className="cs-arrow" />
                </button>
                {optionsDropdown}
            </div>
        );
    }

    // Calcular los valores de visualización antes del return para mantener el return sin lógica
    // depositDisplay: mientras el input está enfocado muestra depositRaw (solo dígitos),
    // al perder foco muestra la versión formateada con '$' y separador de miles.
    // rateDisplay: mientras enfocado muestra rateRaw; al blur añade sufijo '%' para visualización.
    // yearsDisplay: mientras enfocado muestra yearsRaw; al blur muestra 'año' o 'años' según el número.
    // contribDisplay: igual que depositDisplay (moneda con '$' y separador de miles).
    const depositDisplay = depositFocused ? depositRaw : formatCurrency(depositRaw);
    const rateDisplay = rateFocused ? rateRaw : formatPercent(rateRaw);
    const yearsDisplay = yearsFocused ? yearsRaw : formatYears(yearsRaw);
    const contribDisplay = contribFocused ? contribRaw : formatCurrency(contribRaw);

    return (
        <form className="inputs-form">
            <div className="input-group">
                <label>
                    <img src={moneyIcon} alt="money" className="input-icon" />
                    Depósito inicial
                    <span className="info-icon" title="Cantidad de dinero que depositas al inicio.">
                        <img src={infoIcon} alt="info" className="icon-img" />
                    </span>
                </label>
                <input
                    type="text"
                    placeholder="Ej: 1000"
                    value={depositDisplay}
                    onFocus={() => setDepositFocused(true)}
                    onBlur={() => setDepositFocused(false)}
                    onChange={(e) => setDepositRaw(unformatNumber(e.target.value))}
                />
            </div>

            <div className="input-group">
                <label>
                    <img src={percentIcon} alt="percent" className="input-icon" />
                    Tasa de interés anual (%)
                    <span className="info-icon" title="Porcentaje de interés que se aplica cada año.">
                        <img src={infoIcon} alt="info" className="icon-img" />
                    </span>
                </label>
                <input
                    type="text"
                    placeholder="Ej: 8"
                    value={rateDisplay}
                    onFocus={() => setRateFocused(true)}
                    onBlur={() => setRateFocused(false)}
                    onChange={(e) => setRateRaw(unformatNumber(e.target.value))}
                />
            </div>

            <div className="input-group">
                <label>
                    <img src={calendarIcon} alt="calendar" className="input-icon" />
                    Años a invertir
                    <span className="info-icon" title="Cantidad de años que mantendrás la inversión.">
                        <img src={infoIcon} alt="info" className="icon-img" />
                    </span>
                </label>
                <input
                    type="text"
                    placeholder="Ej: 5"
                    value={yearsDisplay}
                    onFocus={() => setYearsFocused(true)}
                    onBlur={() => setYearsFocused(false)}
                    onChange={(e) => setYearsRaw(unformatNumber(e.target.value))}
                />
            </div>

            <div className="input-group">
                <label>
                    <img src={clockIcon} alt="clock" className="input-icon" />
                    Frecuencia de interés
                    <span className="info-icon" title="Periodicidad con la que se capitaliza el interés.">
                        <img src={infoIcon} alt="info" className="icon-img" />
                    </span>
                </label>
                {/* Custom select to ensure neumorphism styling for options */}
                <CustomSelect />
            </div>

            <div className="input-group">
                <label>
                    <img src={moneyIcon} alt="money" className="input-icon" />
                    Aportaciones adicionales
                    <span className="info-icon" title="Dinero extra que agregarás en cada periodo.">
                        <img src={infoIcon} alt="info" className="icon-img" />
                    </span>
                </label>
                <input
                    type="text"
                    placeholder="Ej: 100"
                    value={contribDisplay}
                    onFocus={() => setContribFocused(true)}
                    onBlur={() => setContribFocused(false)}
                    onChange={(e) => setContribRaw(unformatNumber(e.target.value))}
                />
            </div>
        </form>
    )
}
