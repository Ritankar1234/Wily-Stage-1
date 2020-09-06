import React from 'react'
import {Text, View, TouchableOpacity, StyleSheet, TextInput, Image, KeyboardAvoidingView, Alert} from 'react-native'
import db from '../config'
import firebase from 'firebase'
export default class LoginScreen extends React.Component{
    constructor(){
        super()
        this.state={
            emailId:'',
            password:''
        }
    }
    login=async(email, password)=>{
        if(email&&password){
            try{
                const response=await firebase.auth().signInWithEmailAndPassword(email, password)
                if(response){
                    this.props.navigation.navigate('Transaction')
                }
            }
            catch(error){
                switch(error.code){
                    case 'auth/user-not-found': Alert.alert('User does not exists')
                    break;
                    case 'auth/invalid-email': Alert.alert('Incorrect email or password')
                    break;
                }
            }
        }
        else{
            Alert.alert('Enter email and password')
        }
    } 
    render(){
        return(
            <KeyboardAvoidingView style={{alignItems:'center', marginTop:20}}>
             <View>
             <Image source={require("../assets/booklogo.jpg")} style={{width:200, height:200}}>
                
             </Image>
             <Text style={{textAlign:'center', fontSize:30}}>
              Wily
             </Text>
             </View>
             <View>
                 <TextInput style={{width:300, height:40, borderWidth:1.5, fontSize:20, margin:10, paddingLeft:20}} placeholder='abc@example.com' keyboardType='email-address' onChangeText={(text)=>{this.setState({emailId:text})}}>

                 </TextInput>
                 <TextInput style={{width:300, height:40, borderWidth:1.5, fontSize:20, margin:10, paddingLeft:20}} placeholder='enter password' secureTextEntry={true} onChangeText={(text)=>{this.setState({password:text})}}>

                 </TextInput>
             </View>
             <View>
                 <TouchableOpacity style={{height:30, width:90, borderWidth:1, marginTop:20, paddingTop:5, borderRadius:7}} onPress={()=>{this.login(this.state.emailId, this.state.password)}}>
                     <Text style={{textAlign:'center'}}>
                         Login
                     </Text>
                 </TouchableOpacity>
             </View>
            </KeyboardAvoidingView>
        )
    }
}