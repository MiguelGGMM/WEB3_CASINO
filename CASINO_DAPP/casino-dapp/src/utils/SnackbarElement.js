// import { Snackbar } from '@material-ui/core';
// import { makeStyles } from "@material-ui/core";

// const useStyles = makeStyles((theme) => ({
//     snackbar_root: {
//         // @include mainFont();
//         color: '#fff',
//         background: '#F44336 !important',
//         fontSize: '1em !important',
//         border: '4px solid rgba(255,255,255,.5) !important',
//         display: 'flex !important',
//         flexDirection: 'column !important',
//         zIndex: '999'
//     },
//     snackbar_success: {
//         background: '#134e30 !important',
//         backgroundSize: 'cover !important',
//         backgroundPositionY: '10px !important',
//         border: '2px solid #1f943d!important',
//         zIndex: '999'
//     },
//     snackbar_action_button: {
//         // @extend .button;
//         // @include mainFont();
//         color: '#57cc75 !important',
//         background: '#1f943d !important',
//         textShadow: 'none !important',
//         fontSize: '0.5em !important'
//     }
// }));

// export default function SnackbarElement(props) {
//     const {
//         onClose
//     } = props;
    
//     return (
//         <Snackbar
//             {...props}
//             ContentProps={{
//                 classes: {
//                     root: [useStyles.snackbar_root, props.type == 'success' ? useStyles.snackbar_success : null].join(' ')
//                 }
//             }}
//             anchorOrigin={{
//                 vertical: 'bottom',
//                 horizontal: 'right'
//             }}
//             action={
//                 <button
//                     onClick={onClose}
//                     className={[useStyles.snackbar_action_button].join(" ")}>
//                     Close
//                 </button>
//             }
//         />
//     )
// }