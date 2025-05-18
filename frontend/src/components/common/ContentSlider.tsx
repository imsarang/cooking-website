import React from 'react';
import '@/styles/common/contentSlider.css';

interface ContentSliderInterface {
  label: string;
  minimum: number;
  maximum: number;
  step: number;
  name: string;
  units: string;
  setData: React.Dispatch<React.SetStateAction<any>>;
}

const ContentSlider = ({...props }: ContentSliderInterface) => {
  const getPercent = (val: number) => ((val - props.minimum) / (props.maximum - props.minimum)) * 100;

  return (
    <div className="slider">
      <div className="slider-label">{props.label}</div>
      <div className="value-slider">
        <div className="slider-track">
          <div
            className="slider-range"
            style={{
              left: `${getPercent(props.minimum)}%`,
              width: `${getPercent(props.maximum) - getPercent(props.minimum)}%`
            }}
          />
        </div>
        <input
          type="range"
          className="thumb thumb-left"
          step={props.step}
          value={props.minimum}
          onChange={(e) =>
            props.setData((prev: any) => ({
              ...prev,
              [props.name]: { ...prev[props.name], min: parseInt(e.target.value) }
            }))
          }
        />
        <input
          type="range"
          className="thumb thumb-right"
          step={props.step}
          value={props.maximum}
          onChange={(e) =>
            props.setData((prev: any) => ({
              ...prev,
              [props.name]: { ...prev[props.name], max: parseInt(e.target.value) }
            }))
          }
        />
      </div>
      <div className="slider-values">
        <span>{props.minimum}{props.units}</span>
        <span>{props.maximum}{props.units}</span>
      </div>
    </div>
  );
};

export default ContentSlider;
