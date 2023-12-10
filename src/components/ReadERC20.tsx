// src/components/ReadERC20.tsx
import React, {useEffect, useState } from 'react'
import {Text} from '@chakra-ui/react'
import {ERC20ABI as abi} from 'abi/ERC20ABI'
import {ethers} from 'ethers'
import { Contract } from "ethers"
import {SourceVaultABI as sourceabi} from 'abi/SourceVaultABI' 
import { Address } from 'cluster'
import {parseEther } from 'ethers/lib/utils'
import { TransactionResponse,TransactionReceipt } from "@ethersproject/abstract-provider"
import {Button, Input , NumberInput,  NumberInputField,  FormControl,  FormLabel } from '@chakra-ui/react'


interface Props {
    addressContract: string,
    currentAccount: string | undefined
    vaultAddress: string
}

declare let window: any

export default function ReadERC20(props:Props){
  const addressContract = props.addressContract
  const currentAccount = props.currentAccount
  const [totalSupply,setTotalSupply]=useState<string>()
  const [symbol,setSymbol]= useState<string>("")
  const [balance, SetBalance] =useState<number|undefined>(undefined)
  const vaultAddress = props.vaultAddress 
  const defaultamount = '100'; 

  useEffect( () => {
    if(!window.ethereum) return

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const erc20:Contract = new ethers.Contract(addressContract, abi, provider);
    const sourceVault:Contract = new ethers.Contract(addressContract, sourceabi, provider);

    provider.getCode(addressContract).then((result:string)=>{
      //check whether it is a contract
      if(result === '0x') return
    
      erc20.symbol().then((result:string)=>{
          setSymbol(result)
      }).catch((e:Error)=>console.log(e))

      erc20.totalSupply().then((result:string)=>{
          setTotalSupply(ethers.utils.formatEther(result))
      }).catch((e:Error)=>console.log(e))

    })
    //called only once
  },[])  

  //call when currentAccount change
  useEffect(()=>{
    if(!window.ethereum) return
    if(!currentAccount) return

    queryTokenBalance(window)

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const erc20:Contract = new ethers.Contract(addressContract, abi, provider)

    // listen for changes on an Ethereum address
    console.log(`listening for Transfer...`)

    const fromMe = erc20.filters.Transfer(currentAccount, null)
    erc20.on(fromMe, (from, to, amount, event) => {
        console.log('Transfer|sent',  {from, to, amount, event} )
        queryTokenBalance(window)
    })

    const toMe = erc20.filters.Transfer(null, currentAccount)
    erc20.on(toMe, (from, to, amount, event) => {
        console.log('Transfer|received',  {from, to, amount, event} )
        queryTokenBalance(window)
    })

    // remove listener when the component is unmounted
    return () => {
        erc20.removeAllListeners(toMe)
        erc20.removeAllListeners(fromMe)
    }    
  }, [currentAccount])

  async function queryTokenBalance(window:any){
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const erc20:Contract = new ethers.Contract(addressContract, abi, provider);

    erc20.balanceOf(currentAccount)
    .then((result:string)=>{
        SetBalance(Number(ethers.utils.formatEther(result)))
    }).catch((e:Error)=>console.log(e))
  }

  async function approve(event:React.FormEvent) {
    event.preventDefault()
    if(!window.ethereum) return    
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const erc20:Contract = new ethers.Contract(addressContract, abi, signer)
    
    erc20.approve(vaultAddress,parseEther(defaultamount))
      .then((tr: TransactionResponse) => {
        console.log(`TransactionResponse TX hash: ${tr.hash}`)
        tr.wait().then((receipt:TransactionReceipt)=>{console.log("transfer receipt",receipt)})
      })
      .catch((e:Error)=>console.log(e))

  }

  return (
    <div>
        <Text><b>BnM Contract</b>: {addressContract}</Text>
        <Text><b>BnM Token Supply</b>:{totalSupply} {symbol}</Text>
        <Text my={4}><b>BnM Token in current account</b>: {balance} {symbol}</Text>
        <form onSubmit={approve}>
        <Text>Please approve before Depositing</Text>
        <Button type="submit" isDisabled={!currentAccount}>Approve</Button>
        </form>
    </div>
    
  )
}
