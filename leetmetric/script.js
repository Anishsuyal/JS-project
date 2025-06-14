document.addEventListener("DOMContentLoaded", function() {
    let searchButton = document.getElementById("search-btn");
    let usernameInput = document.getElementById("user-input");
    const userContainer = document.querySelector(".user-container");
    const statsContainer = document.querySelector(".stats-container");
    const totalProgressCircle = document.querySelector(".total-progress");
    const easyProgressCircle = document.querySelector(".easy-progress");
    const mediumProgressCircle = document.querySelector(".medium-progress");
    const hardProgressCircle = document.querySelector(".hard-progress");
    const totalLabel = document.getElementById("total-label");
    const easyLabel = document.getElementById("easy-label");
    const mediumLabel = document.getElementById("medium-label");
    const hardLabel = document.getElementById("hard-label");
    const cardStatsContainer = document.querySelector(".stats-cards");

    //return true or false based on a regex
    function validateUsername(username) {
        if(username.trim() === "") {
            alert("Username should not be empty");
            return false;
        }
        const regex = /^[a-zA-Z0-9_-]{1,15}$/;
        const isMatching = regex.test(username);
        if(!isMatching) {
            alert("Invalid Username");
        }
        return isMatching;
    }

    async function fetchUserDetails(username) {
        try {
            searchButton.textContent = "Searching...";
            searchButton.disabled = true;

            const proxyUrl = 'https://cors-anywhere.herokuapp.com/' 
            const targetUrl = 'https://leetcode.com/graphql/';

            const myHeaders = new Headers();
            myHeaders.append("content-type", "application/json");

            const graphql = JSON.stringify({
                query: `
                    query userSessionProgress($username: String!) {
                      allQuestionsCount {
                        difficulty
                        count
                      }
                      matchedUser(username: $username) {
                        submitStats {
                          acSubmissionNum {
                            difficulty
                            count
                            submissions
                          }
                          totalSubmissionNum {
                            difficulty
                            count
                            submissions
                          }
                        }
                      }
                    }
                `,
                variables: { "username": `${username}` }
            });

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: graphql,
            };

            const response = await fetch(proxyUrl + targetUrl, requestOptions);
            if(!response.ok) {
                throw new Error("Unable to fetch the User details");
            }
            const parsedData = await response.json();
            console.log("Logging data: ", parsedData);

            
            userContainer.innerHTML = `
            <div style="
             display: flex; 
              justify-content: center; 
    align-items: center;
    gap: 10px; /* space between username and reload */
  ">
    <p style="margin: 0; font-size: 1.5rem;">${username}</p>
    <button id="reload-btn" title="Reset" style="
      background: transparent; 
      border: none; 
      color: white; 
      font-size: 1.5rem; 
      cursor: pointer;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
    ">🔄</button>
  </div>
`;


            const reloadBtn = document.getElementById("reload-btn");
            reloadBtn.addEventListener("click", () => {
                resetToInitialState();
            });

            statsContainer.style.display = "block";

            displayUserData(parsedData);
        }
        catch(error) {
            statsContainer.innerHTML = `<p>${error.message}</p>`
        }
        finally {
            searchButton.textContent = "Search";
            searchButton.disabled = false;
        }
    }

    function updateProgress(solved, total, label, circle) {
        const progressDegree = (solved / total) * 100;
        circle.style.setProperty("--progress-degree", `${progressDegree}%`);
        label.textContent = `${solved}/${total}`;
    }

    function displayUserData(parsedData) {
        const totalQues = parsedData.data.allQuestionsCount[0].count;
        const totalEasyQues = parsedData.data.allQuestionsCount[1].count;
        const totalMediumQues = parsedData.data.allQuestionsCount[2].count;
        const totalHardQues = parsedData.data.allQuestionsCount[3].count;

        const solvedTotalQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[0].count;
        const solvedTotalEasyQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[1].count;
        const solvedTotalMediumQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[2].count;
        const solvedTotalHardQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[3].count;

        updateProgress(solvedTotalQues, totalQues, totalLabel, totalProgressCircle);
        updateProgress(solvedTotalEasyQues, totalEasyQues, easyLabel, easyProgressCircle);
        updateProgress(solvedTotalMediumQues, totalMediumQues, mediumLabel, mediumProgressCircle);
        updateProgress(solvedTotalHardQues, totalHardQues, hardLabel, hardProgressCircle);

        const cardsData = [
            {label: "Overall Submissions", value: parsedData.data.matchedUser.submitStats.totalSubmissionNum[0].submissions },
            {label: "Overall Easy Submissions", value: parsedData.data.matchedUser.submitStats.totalSubmissionNum[1].submissions },
            {label: "Overall Medium Submissions", value: parsedData.data.matchedUser.submitStats.totalSubmissionNum[2].submissions },
            {label: "Overall Hard Submissions", value: parsedData.data.matchedUser.submitStats.totalSubmissionNum[3].submissions },
        ];

        cardStatsContainer.innerHTML = cardsData.map(
            data => 
                `<div class="card">
                    <h4>${data.label}</h4>
                    <p>${data.value}</p>
                </div>`
        ).join("");
    }

    function resetToInitialState() {
       
        userContainer.innerHTML = `
            <p>Enter your username below:</p>
            <div class="user-input-container">
                <input type="text" placeholder="enter your username here" id="user-input">
                <button id="search-btn">Search</button>
            </div>
        `;
        statsContainer.style.display = "none";
        cardStatsContainer.innerHTML = "";

     
        usernameInput = document.getElementById("user-input");
        searchButton = document.getElementById("search-btn");

        
        searchButton.addEventListener('click', () => {
            const username = usernameInput.value;
            if(validateUsername(username)) {
                fetchUserDetails(username);
            }
        });

        usernameInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                searchButton.click();
            }
        });
    }

    // Initial event listeners
    searchButton.addEventListener('click', function() {
        const username = usernameInput.value;
        if(validateUsername(username)) {
            fetchUserDetails(username);
        }
    });

    usernameInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            searchButton.click();
        }
    });
});
