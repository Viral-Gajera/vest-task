import axios from "axios";
import { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";

function App() {
    let [hotelData, setHotelData] = useState({
        hotels: [],
        requests: [],
    });

    let [totalRequests, setTotalRequests] = useState(0);

    let [departments, setDepartments] = useState([]);

    let series = [
        {
            name: "Desktops",
            data: hotelData.requests,
        },
    ];

    let options = {
        chart: {
            height: 500,
            type: "line",
            zoom: {
                enabled: false,
            },
            toolbar: {
                show: false,
            },
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            curve: "straight",
        },
        title: {
            text: "Requests per hotel",
            align: "center",
        },
        grid: {
            row: {
                colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
                opacity: 0.5,
            },
        },
        xaxis: {
            categories: hotelData.hotels,
        },
    };

    useEffect(function () {
        async function fetchData() {
            let requests = [];

            try {
                const { data } = await axios.get("https://checkinn.co/api/v1/int/requests");
                requests = data.requests;
            } catch (error) {
                console.error("Error fetching data:", error.message);
            }
            if (!requests.length) return;

            // Use HASHING technique
            // O(1) retrieval time one object created

            // {
            //   id : {
            //     hotelName: "Hotel Name",
            //     noOfRequests: 1
            //   }
            // }

            // id -> hotel id (as key of object is unique)

            let data = {};
            for (let request of requests) {
                if (data[request?.hotel.id]) {
                    data[request.hotel.id].noOfRequests++;
                } else {
                    data[request.hotel.id] = {
                        hotelName: request.hotel.name,
                        noOfRequests: 1,
                    };
                }
            }

            let uniqueHotes = [];
            let noOfRequests = [];
            let totalRequests = 0;

            for (let hotel in data) {
                uniqueHotes.push(data[hotel].hotelName);
                noOfRequests.push(data[hotel].noOfRequests);
                totalRequests += data[hotel].noOfRequests;
            }

            setHotelData({
                hotels: uniqueHotes,
                requests: noOfRequests,
            });
            setTotalRequests(totalRequests);

            let departments = {};
            for (let request of requests) {
                let department = request.desk.name;
                departments[department] = true;
            }

            setDepartments(Object.keys(departments));
        }

        fetchData();
    }, []);

    return (
        <main className="h-[100vh] flex items-center justify-center">
            <div className="border-dashed border py-20 border-black rounded-lg w-[80%] flex items-center justify-center">
                <div className="w-[60%]">
                    <div className="">
                        <ReactApexChart
                            options={options}
                            series={series}
                            type="line"
                            height={350}
                        />
                    </div>
                    <div>
                        <p className="text-center mt-5">Total requests: {totalRequests}</p>
                    </div>
                    <div>
                        <p className="text-center mt-5 text-xs">
                            List of unique department names across all Hotels:{" "}
                            {departments.join(", ")}
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default App;
