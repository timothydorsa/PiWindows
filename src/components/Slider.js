import React, { useState } from 'react';

export default function Slider({ value = 50, min = 20, max = 80, rangeMin = 0, rangeMax = 100, change }) {
  const [current, setCurrent] = useState(value);
  const [minVal, setMinVal] = useState(min);
  const [maxVal, setMaxVal] = useState(max);

  const handleSliderChange = e => {
    const val = Number(e.target.value);
    if (val >= minVal && val <= maxVal) {
      change && change(val);
      setCurrent(val);
    }
  };

  const changeMinimum = e => {
    const val = Number(e.target.value);
    if (val > current && val > maxVal) {
      setMinVal(val);
      setCurrent(val);
      setMaxVal(val + 1);
    } else if (val > current) {
      setMinVal(val);
      setCurrent(val);
    } else {
      setMinVal(val);
    }
  };

  const changeMaximum = e => {
    const val = Number(e.target.value);
    if (val < current && val < minVal) {
      setMaxVal(val);
      setMinVal(val - 1);
      setCurrent(val);
    } else if (val < current) {
      setMaxVal(val);
      setCurrent(val);
    } else {
      setMaxVal(val);
    }
  };

  const changeValue = e => {
    setCurrent(Number(e.target.value));
  };

  const ranges = [];
  ranges.push(<option key={rangeMin} value={`${rangeMin}`} />);
  let i = rangeMin;
  while (i < rangeMax) {
    i += 10;
    ranges.push(<option key={i} value={`${i}`} label={`${i}`} />);
  }

  return (
    <div className="slidercontainer">
      <input onChange={handleSliderChange} type="range" value={current} className="slider" list="ranges" />
      <div className="slider-inputs">
        <input type="number" className="slider-input" value={minVal} onChange={changeMinimum} />
        <input type="number" className="slider-input" value={current} onChange={changeValue} />
        <input type="number" className="slider-input" value={maxVal} onChange={changeMaximum} />
      </div>
      <datalist id="ranges">{ranges}</datalist>
    </div>
  );
}
