import React from 'react'
import {Text, View, TouchableOpacity, StyleSheet, TextInput, Image, KeyboardAvoidingView, Alert} from 'react-native'
import * as Permissions from 'expo-permissions'
import {BarCodeScanner} from 'expo-barcode-scanner'
import db from '../config'
import firebase from 'firebase'
export default class BookTransactionScreen extends React.Component{
    constructor(){
        super();
        this.state={
            hasCameraPermissions:null,
            scannned:false,
            scannedBookId:'',
            scannedStudentId:'',
            buttonState:'normal',
            transactionMessage: ''
        }

    }
    getPermissionsAsync = async (Id) => {
        const { status } = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({ hasCameraPermissions: status === 'granted', buttonState:Id, scanned:'false' });
      };
      handleBarCodeScanned=async({type, data})=>{
          const {buttonState}=this.state
          if(buttonState==='bookId'){
            this.setState({
                scanned:true,
                scannedBookId:data,
                buttonState:'normal'
            })
          }
         else if(buttonState==='studentId'){
            this.setState({
                scanned:true,
                scannedStudentId:data,
                buttonState:'normal'
            })
         }
      }
      initiateBookIssue=async()=>{
          db.collection('transactions').add({
              'studentId':this.state.scannedStudentId,
              'bookId':this.state.scannedBookId,
              'date':firebase.firestore.Timestamp.now().toDate(),
              'transactionType':'issue'
          })
          db.collection('books').doc(this.state.scannedBookId).update({
              'bookAvailability':false
          })
          db.collection('students').doc(this.state.scannedStudentId).update({
            'numberOfBooksIssued':firebase.firestore.FieldValue.increment(1)
        })
        this.setState({
            scannedStudentId:'',
            scannedBookId:''
        })
      }
      initiateBookReturn=async()=>{
        db.collection('transactions').add({
            'studentId':this.state.scannedStudentId,
            'bookId':this.state.scannedBookId,
            'date':firebase.firestore.Timestamp.now().toDate(),
            'transactionType':'return'
        })
        db.collection('books').doc(this.state.scannedBookId).update({
            'bookAvailability':true
        })
        db.collection('students').doc(this.state.scannedStudentId).update({
          'numberOfBooksIssued':firebase.firestore.FieldValue.increment(-1)
      })
      this.setState({
          scannedStudentId:'',
          scannedBookId:''
      })
    }
      handleTransaction=async()=>{
          var transactionType=await this.checkBookEligibility()
          if(!transactionType){
              Alert.alert('The book does not exist in the database')
              this.setState({
                  scannedStudentId:'',
                  scannedBookId:''
              })
          }
          else if(transactionType==='issue'){
              var isStudentEligible=await this.checkStudentEligibilityForBookIssue()
              if(isStudentEligible){
                  this.initiateBookIssue()
                  Alert.alert('Book issue for the student')
              }
          }
          else if(transactionType==='return'){
            var isStudentEligible=await this.checkStudentEligibilityForBookReturn()
            if(isStudentEligible){
                this.initiateBookReturn()
                Alert.alert('Book return to the library')
            }
        }
      }
      checkBookEligibility=async()=>{
          const bookRef=await db.collection('books').where('bookId','==',this.state.scannedBookId).get()
          var transactionType=''
          if(bookRef.docs.length===0){
              transactionType=false
          }
          else{
              bookRef.docs.map((doc)=>{
                  var book=doc.data()
                  if(book.bookAvailability){
                      transactionType='issue'
                  }
                  else{
                      transactionType='return'
                  }
              })
          }
          return transactionType
      }
      checkStudentEligibilityForBookIssue=async()=>{
        const studentRef=await db.collection('students').where('studentId','==',this.state.scannedStudentId).get()
        var isStudentEligible=''
        if(studentRef.docs.length===0){
            this.setState({
                scannedStudentId:'',
                scannedBookId:''
            })
            isStudentEligible=false
            Alert.alert('Student ID does not exsist in the database')
        }
        else{
            studentRef.docs.map((doc)=>{
                var student=doc.data()
                if(student.numberOfBooksIssued<2){
                    isStudentEligible=true
                }
                else{
                    isStudentEligible=false
                    Alert.alert('Student has already issued two books')
                    this.setState({
                        scannedStudentId:'',
                        scannedBookId:''
                    })
                }
            })
        }
        return isStudentEligible
    }
    checkStudentEligibilityForBookReturn=async()=>{
        const studentRef=await db.collection('transactions').where('bookId','==',this.state.scannedBookId).limit(1).get()
        var isStudentEligible=''
        
        
            studentRef.docs.map((doc)=>{
                var lastBookTransaction=doc.data()
                if(lastBookTransaction.studentId=this.state.scannedStudentId){
                    isStudentEligible=true
                }
                else{
                    isStudentEligible=false
                    Alert.alert('The book was not issued by the students')
                    this.setState({
                        scannedStudentId:'',
                        scannedBookId:''
                    })
                }
            })
        
        return isStudentEligible
    }
    render(){
        const hasCameraPermissions=this.state.hasCameraPermissions
        const scanned=this.state.scanned
        const buttonState=this.state.buttonState
        if(buttonState!=='normal'&& hasCameraPermissions){
        return(
            <BarCodeScanner onBarCodeScanned={scanned ? undefined:this.handleBarCodeScanned} style={StyleSheet.absoluteFillObject}>

            </BarCodeScanner>
            
        )
        }
        else if(buttonState==='normal'){
            return(
                <View style={styles.container}>
                  <View>
                      <Image source={require("../assets/booklogo.jpg")} style={{width:200, height:200}}>
                
                      </Image>
                  </View>
                  <View style={styles.inputView}>
                    <TextInput style={styles.inputBox} onChangeText={(text)=>{
                        this.setState({
                            scannedBookId: text
                        })
                    }} placeholder='bookId' value={this.state.scannedBookId}>

                    </TextInput>
                    <TouchableOpacity style={styles.scannedButton} onPress={()=>{this.getPermissionsAsync("bookId")}}>
                     <Text style={styles.buttonText}>
                      Scan
                     </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.inputView}>
                    <TextInput style={styles.inputBox} onChangeText={(text)=>{
                        this.setState({
                            scannedStudentId: text
                        })
                    }} placeholder='studentId' value={this.state.scannedStudentId}>

                    </TextInput>
                    <TouchableOpacity style={styles.scannedButton} onPress={()=>{this.getPermissionsAsync("studentId")}}>
                     <Text style={styles.buttonText}>
                      Scan
                     </Text>
                    </TouchableOpacity>
                  </View>
                  <Text>
                     {this.state.transactionMessage}
                  </Text>
                  <TouchableOpacity  style={styles.submitButton} onPress={async()=>{var transactionMessage=await this.handleTransaction()}}>
                     <Text style={styles.submitButtonText}>
                         Submit
                     </Text>
                  </TouchableOpacity>
                </View>
            )
        }
    }
}
const styles=StyleSheet.create({
    container:{
        flex:1,
        justifyContent:'center',
        alignItems:'center'
    },
    displayText:{
        fontSize:15

    },
    scannedButton:{
        backgroundColor:'yellow',
        width:50,
        borderWidth:1.5,
        borderLeftWidth:0
    },
    buttonText:{
        fontSize:15,
        textAlign:'center',
        marginTop:10
    },
    inputView:{
        flexDirection:"row",
        margin:20
    },
    inputBox:{
        width:200,
        height:40,
        borderWidth:1.5,
        borderRightWidth:0,
        fontSize:20
    },
    submitButton:{
        backgroundColor:'#fbc02d',
        width:100,
        height:50
    },
    submitButtonText:{
        padding:10,
        textAlign:'center',
        fontSize:20,
        fontWeight:'bold',
        color: 'white'
    }
})

