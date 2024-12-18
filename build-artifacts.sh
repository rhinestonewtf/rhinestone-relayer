
#!/bin/bash


# Check if a contract name is provided
if [ $# -eq 0 ]; then
    echo "Please provide a contract name as an argument."
    echo "Usage: $0 <ContractName>"
    exit 1
fi

CONTRACT_NAME=$1

mkdir -p ./artifacts/$CONTRACT_NAME
forge build contracts/$CONTRACT_NAME.sol
cp ./out/$CONTRACT_NAME.sol/* ./artifacts/$CONTRACT_NAME/.
forge verify-contract --via-ir --show-standard-json-input $(cast address-zero) ./contracts/$CONTRACT_NAME.sol:$CONTRACT_NAME > ./artifacts/$CONTRACT_NAME/verify.json

