import { useState } from "react";
import { useIPFS } from "./useIPFS";

/**
 * This is a hook that loads the NFT metadata in case it doesn't alreay exist
 * If metadata is missing, the object is replaced with a reactive object that updatees when the data becomes available
 * The hook will retry until request is successful (with OpenSea, for now)
 */
export const useVerifyMetadata = () => {
    const { resolveLink } = useIPFS();
    const [results, setResults] = useState({});

    /**
     * Fet Metadata  from NFT and Cache Results
     * @param {object} NFT 
     * @returns NFT
     */
    async function verifyMetadata(NFT) {
        //Pass Through if Metadata already present
        if (NFT.metadata) return NFT;
        //Get the Metadata
        await getMetadata(NFT);
        //Return Hooked NFT Object
        // console.log(results);
        return results?.[NFT.token_uri] ? results?.[NFT.token_uri] : NFT;
    }//verifyMetadata()

    /**
     * Extract Metadata from NFT, 
     *  Fallback: Fetch from URI
     * @param {object} NFT 
     * @returns void
     */
    async function getMetadata(NFT) {
        //Validate URI
        if (!NFT.token_uri || !NFT.token_uri.includes('://')) {
            console.log('getMetadata() Invalid URI', { URI: NFT.token_uri, NFT });
            return;
        }
        //Get Metadata
        const resultsJson = await fetch(NFT.token_uri);
        const metadata = await resultsJson.json();

        if (!metadata) {
            //Log
            console.error("useVerifyMetadata.getMetadata() No Metadata found on URI:", { URI: NFT.token_uri, NFT });
        }
        //Handle Setbacks
        else if (metadata?.detail && metadata.detail.includes("Request was throttled")) {
            //Log
            console.warn("useVerifyMetadata.getMetadata() Bad Result for:" + NFT.token_uri + "  Will retry later", { results, metadata });
            //Retry That Again after 1s
            setTimeout(function () { getMetadata(NFT); }, 1000);
        }//Handle Opensea's {detail: "Request was throttled. Expected available in 1 second."}
        else {//No Errors
            //Set
            // setMetadata(NFT, metadata);
            //Log
            // console.log("getMetadata() Late-load for NFT Metadata " + NFT.token_uri, { metadata });
            return metadata;
        }//Valid Result        
    }//getMetadata()

    return { verifyMetadata, getMetadata };

}//useVerifyMetadata()