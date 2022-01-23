const BASE_URL = process.env.REACT_APP_BASE_URL
const fetchAll = async (address) => {
    const results = await fetch(`${BASE_URL}nft/balance?address=${address}`)
    const json = await results.json()
    return json;
}
const nft = {
    fetchAll
}

export default nft;