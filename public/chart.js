document.getElementById("analysisForm").addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const contractAddress = document.getElementById("contractAddress").value;
    const resultsDiv = document.getElementById("results");
  
    try {
      const [analyzeResponse, tokenResponse] = await Promise.all([
        fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contractAddress }),
        }).then((res) => res.json()),
        fetch("/api/tokenInfo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contractAddress }),
        }).then((res) => res.json()),
      ]);
  
      if (analyzeResponse.error || tokenResponse.error) {
        resultsDiv.innerHTML = `<p class="error">${analyzeResponse.error || tokenResponse.error}</p>`;
        return;
      }
  
      resultsDiv.innerHTML = `
        <h2>Token Information</h2>
        <p>Name: ${tokenResponse.name}</p>
        <p>Symbol: ${tokenResponse.symbol}</p>
        <p>Decimals: ${tokenResponse.decimals}</p>
        <p>Supply: ${tokenResponse.supply}</p>
        <canvas id="holdChart"></canvas>
      `;
  
      const ctx = document.getElementById("holdChart").getContext("2d");
      new Chart(ctx, {
        type: "pie",
        data: {
          labels: ["< 15min", "15min - 1h", "1h - 2h", "> 2h"],
          datasets: [
            {
              label: "Hold Times",
              data: [
                analyzeResponse["<15min"],
                analyzeResponse["15min-1h"],
                analyzeResponse["1h-2h"],
                analyzeResponse[">2h"],
              ],
              backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50"],
            },
          ],
        },
      });
    } catch (error) {
      resultsDiv.innerHTML = `<p class="error">An error occurred while fetching data.</p>`;
    }
  });
  