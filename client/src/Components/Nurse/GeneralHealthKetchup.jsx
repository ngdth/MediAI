import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const GeneralHealthKetchup = () => {
  const [pulseRate, setPulseRate] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [bodyTemperature, setBodyTemperature] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [generalCondition, setGeneralCondition] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const healthInfo = {
      pulseRate,
      bloodPressure,
      bodyTemperature,
      weight,
      height,
      generalCondition,
    };

    try {
      const response = await axios.post('http://localhost:8080/appointment/general-health', healthInfo, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      // Redirect after successful submission
      navigate('/appointments'); // Hoặc trang mà bạn muốn chuyển hướng đến
    } catch (error) {
      console.error('Error creating general health ketchup:', error);
    }
  };

  return (
    <div className="container">
      <h2 className="text-center mt-4">Thông tin khám bệnh - Các chỉ số sức khỏe</h2>
      
      {/* Thông tin khám bệnh (Bảng) */}
      <div className="mb-4">
        <h3 className="text-primary">Thông tin khám thể lực</h3>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Chỉ số</th>
              <th>Giá trị</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Mạch (số nhịp/phút)</td>
              <td>
                <input
                  type="number"
                  value={pulseRate}
                  onChange={(e) => setPulseRate(e.target.value)}
                  placeholder="Mạch "
                  className="form-control"
                />
              </td>
            </tr>
            <tr>
              <td>Huyết áp (mmHg)</td>
              <td>
                <input
                  type="text"
                  value={bloodPressure}
                  onChange={(e) => setBloodPressure(e.target.value)}
                  placeholder="Huyết áp "
                  className="form-control"
                />
              </td>
            </tr>
            <tr>
              <td>Nhiệt độ cơ thể  (°C)</td>
              <td>
                <input
                  type="number"
                  value={bodyTemperature}
                  onChange={(e) => setBodyTemperature(e.target.value)}
                  placeholder="Nhiệt độ cơ thể"
                  className="form-control"
                />
              </td>
            </tr>
            <tr>
              <td>Cân nặng (kg)</td>
              <td>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Cân nặng "
                  className="form-control"
                />
              </td>
            </tr>
            <tr>
              <td>Chiều cao (cm)</td>
              <td>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="Chiều cao "
                  className="form-control"
                />
              </td>
            </tr>
            <tr>
              <td>Tình trạng chung</td>
              <td>
                <textarea
                  value={generalCondition}
                  onChange={(e) => setGeneralCondition(e.target.value)}
                  placeholder="Tình trạng chung"
                  className="form-control"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Nút lưu thông tin */}
      <div className="d-flex justify-content-end mt-4">
        <button type="submit" className="btn btn-primary" onClick={handleSubmit}>
          Lưu 
        </button>
      </div>
    </div>
  );
};

export default GeneralHealthKetchup;
