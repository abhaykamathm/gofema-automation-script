async function fetchDisastersData() {
  const response = await fetch(
    `https://www.fema.gov/api/open/v1/FemaWebDisasterDeclarations`
  );
  if (!response.ok) {
    throw new Error(`API request failed with status ${response?.status}`);
  }
  const data = await response.json();
  //   return data.FemaWebDisasterDeclarations;
  console.log(data.FemaWebDisasterDeclarations);
}

fetchDisastersData();
