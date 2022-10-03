import React, { useLayoutEffect, useRef } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import s from "../Details/Details.module.css";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import {
  detailReset,
  getUserEmail,
  getUserId,
  setUserVisible,
} from "../../Redux/Actions/DevUser";
import diamantess from "../Home/Assets/Diamante/diamante.png";
import SideMenu from "../Landing/SideMenu/SideMenu";
import Loader from "../Loader/Loader";
import "boxicons";
import { useAuth0 } from "@auth0/auth0-react";
import { emailer } from "../../Redux/Actions/Emailer";
import { useState } from "react";
import { consultSub, setSubscriptionId } from "../../Redux/Actions/MercadoPago";
import Iframe from "react-iframe";
import { IoMdCloseCircle } from "react-icons/io";
import Contrato from "./Contrato";
import useUser from "../../Hooks/useUser";
import Contracts from "../Contracts/Contracts";
import useFetchConsultSub from "../../Hooks/useFetchConsultSub";
import { putContrato } from "../../Redux/Actions/Contracts";
import { BsChevronDoubleDown } from "react-icons/bs";
import ScrollTopDetail from "./ScrollTopDetail";

import SvgChica from "./SvgChica";
// import { Swal } from "sweetalert2";

export default function Details() {
  const { isAuthenticated, isLoading, loginWithRedirect, logout } = useAuth0();

  let dispatch = useDispatch();
  let navigate = useNavigate();
  let { id } = useParams();

  let [disabled, setDisabled] = useState(false);

  const userByEmail = useSelector((state) => state.devUser.userByEmail);
  const user = useUser();

  const [userProfile, setUserProfile] = useState(false);
  useEffect(() => {
    dispatch(getUserEmail(user?.email));
    id === userByEmail?.id ? setUserProfile(true) : setUserProfile(false);
  }, [dispatch, id, user?.email, userByEmail?.id]);

  useEffect(() => {
    dispatch(getUserId(id));
  }, [dispatch, id]);

  const userDetail = useSelector((state) => state.devUser.details);

  const consultaSub = useSelector(
    (state) => state.mercadoPago.SubscriptionConsult
  );

  const [mostrarSub, setMostrarSub] = useState(false);

  const linkPago = consultaSub?.init_point;

  const [contratoDetail, SetContratoDetail] = useState(false);

  const scrollTo = (section) => {
    section.current.scrollIntoView({
      behavior: "smooth",
    });
  };

  const refContracts = useRef(null);

  //---esta funcion evalua que contratos pueden o no mostrarse -----------------------
  const contratosVisibles = (contratos, user) => {
    let visibles = contratos.filter((cur) => {
      if (cur.status === "Concluido") {
        return true;
      }
      if (cur.employer === user.user_id) {
        return true;
      }
      if (cur.developer === user.user_id) {
        return true;
      } else {
        return false;
      }
    });
    return visibles;
  };

  let contratosS = userDetail?.contratos !== undefined && userDetail?.contratos;
  let contratosArenderizar =
    contratosS && user.user_id && contratosVisibles(contratosS, user);
  //------------------------------------------------------------------------------------

  //-----esta funcion nos da la fecha de hoy en formato correcto-------
  const today = new Date().toLocaleDateString({
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const setOrderDate = (today) => {
    let division = today.split("/");
    let dia = division[0];
    let mes = division[1];
    let año = division[2];
    division[0] = año;
    division[2] = dia;

    if (mes.length === 1) {
      mes = "0" + mes;
    }
    if (dia.length === 1) {
      dia = "0" + dia;
    }
    let fechaExacta = año + "-" + mes + "-" + dia;
    return fechaExacta;
  };

  //-----------------------------------------------------------------------

  //---esta funcion compara la fecha actual contra le fecha ingresada e indica si es "-","+","=" ---
  const compararFechas = (hoy, fechaAcomparar) => {
    let hoyy = hoy.split("-");
    let comp = fechaAcomparar.split("-");

    let año_hoyy = hoyy[0];
    let año_comp = comp[0];
    if (Number(año_comp) < Number(año_hoyy)) {
      return "-";
    }
    if (Number(año_comp) > Number(año_hoyy)) {
      return "+";
    }
    if (Number(año_comp) === Number(año_hoyy)) {
      let mes_hoy = hoyy[1];
      let mes_comp = comp[1];
      if (Number(mes_comp) < Number(mes_hoy)) {
        return "-";
      }
      if (Number(mes_comp) > Number(mes_hoy)) {
        return "+";
      }
      if (Number(mes_comp) === Number(mes_hoy)) {
        let dia_hoy = hoyy[2];
        let dia_comp = comp[2];
        if (Number(dia_comp) < Number(dia_hoy)) {
          return "-";
        }
        if (Number(dia_comp) > Number(dia_hoy)) {
          return "+";
        }
        if (Number(dia_comp) === Number(dia_hoy)) {
          return "=";
        }
      }
    }
  };
  //------------------------------------------------------------------------------------

  //-esta funcion modifica en DB la propiedad status al contrato ingresado deacuerdo a la fecha----
  const SeteadoraStatusContratos = (fecha_de_hoy, unContrato) => {
    if (compararFechas(fecha_de_hoy, unContrato.date) === "-") {
      // si date es menor a fecha de hoy
      //setear status en "Inactivo"
      dispatch(putContrato(unContrato.id, { status: "Inactivo" }));
    }
    if (
      compararFechas(fecha_de_hoy, unContrato.date) === "+" &&
      compararFechas(unContrato.expiration_date, unContrato.date) === "-"
    ) {
      // si date es mayor a fecha de hoy y menor a fecha de termino
      //setear status en "Activo"
      dispatch(putContrato(unContrato.id, { status: "Activo" }));
    }
    if (compararFechas(fecha_de_hoy, unContrato.expiration_date) === "-") {
      // si fecha de fin es menor a fecha de hoy
      //setear status en "Concluido"
      dispatch(putContrato(unContrato.id, { status: "Concluido" }));
    }
  };
  //---------------------------------------------------------------------------------------

  let fecha_de_hoy = setOrderDate(today);

  const mapeaYmodificaContratos = (fecha_de_hoy) => {
    userDetail.contratos.forEach((cur) =>
      SeteadoraStatusContratos(fecha_de_hoy, cur)
    );
  };

  userDetail?.contratos && mapeaYmodificaContratos(fecha_de_hoy);

  const handleContact = () => {
    if (isAuthenticated) {
      SetContratoDetail(!contratoDetail);
    } else {
      loginWithRedirect();
    }
  };

  const [userPremium, setUserPremium] = useState(false);

  useEffect(() => {
    if (userDetail?.premium) {
      console.log(`usuario premiun: ${userDetail?.premium}`);
      setUserPremium(true);
    } else {
      setUserPremium(false);
    }
  }, [userDetail?.premium]);

  const handlePremium = () => {
    setMostrarSub(!mostrarSub);
  };
  const handlePremiumOFF = () => {
    // setMostrarSub(!mostrarSub);
    dispatch(
      setSubscriptionId({
        user_id: userByEmail?.id,
        subscription_id: consultaSub?.id,
        status: "pending",
      })
    );
    window.location.reload();
  };
  useEffect(() => {
    dispatch(
      setSubscriptionId({
        user_id: userByEmail?.id,
        subscription_id: consultaSub?.id,
        status: consultaSub?.status,
      })
    );
  }, [consultaSub?.id, consultaSub?.status, dispatch, userByEmail?.id]);

  const handleCloseSub = () => {
    dispatch(consultSub(consultaSub?.id));
    setTimeout(() => {
      dispatch(
        setSubscriptionId({
          user_id: userByEmail?.id,
          subscription_id: consultaSub?.id,
          status: consultaSub?.status,
        })
      );
      setMostrarSub(false);
    }, 1000);
  };

  const handleCleanAndBack = () => {
    dispatch(detailReset());
    navigate("/work");
  };

  const handleVisible = (e) => {
    dispatch(setUserVisible(e.target.checked, id));
  };

  return contratoDetail ? (
    <Contrato
      userByEmail={userByEmail.id}
      userDetail={userDetail}
      id={id}
      contratoDetail={contratoDetail}
      SetContratoDetail={SetContratoDetail}
    />
  ) : !userByEmail?.email && !userDetail?.email ? (
    <Loader />
  ) : (
    <div className={s.bodydelosbodys}>
      <div
        className={!mostrarSub ? s.bodyIframeNone : s.bodyIframe}
        onClick={handleCloseSub}
      >
        <button onClick={handleCloseSub} className={s.Icon}>
          <span htmlFor="">
            <IoMdCloseCircle />
          </span>
        </button>

        <div className={s.containerIframe}>
          <div className={s.lds_ring}>
            <div></div>
            <div></div>
            <div></div>
          </div>
          {
            <Iframe
              // style={}
              loading="CARGANDOOOOOOOOOOOOOOO..."
              className={s.iframe}
              url={linkPago}
              id=""
              display="block"
              position="relative"
              allowFullscreen={false}
            />
          }
        </div>
      </div>
      <div className={s.body}>
        <div className={s.sideM}>
          <div className={s.modal}>
            <div className={s.container}>
              <SideMenu />
              <div className={s.backGroundDiv}>
                <div>
                  <SvgChica />
                </div>
                <div>
                  <img
                    className={s.diamantitos}
                    src={diamantess}
                    alt="diamantes"
                  />
                </div>
                <div className={s.divBox}>
                  <div className={s.textBox}>
                    <h2>
                      {userDetail?.name
                        ? userDetail?.name + " "
                        : userByEmail?.name + " "}
                      {userDetail?.lastName
                        ? userDetail?.lastName
                        : userByEmail?.lastName}
                    </h2>
                    <br />
                    <div className={s.imageBox}>
                      {userDetail?.profilePicture &&
                      userByEmail?.profilePicture ? (
                        <img
                          className={
                            userPremium && userByEmail?.premium
                              ? s.premium
                              : s.imgRender
                          }
                          src={
                            userDetail?.profilePicture
                              ? userDetail?.profilePicture
                              : userByEmail?.profilePicture
                          }
                          alt={
                            userDetail?.name
                              ? userDetail?.name
                              : userByEmail?.name
                          }
                        />
                      ) : (
                        <svg
                          className={s.imgSvg}
                          viewBox="0 0 448 512"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M224 256c70.7 0 128-57.31 128-128s-57.3-128-128-128C153.3 0 96 57.31 96 128S153.3 256 224 256zM274.7 304H173.3C77.61 304 0 381.6 0 477.3c0 19.14 15.52 34.67 34.66 34.67h378.7C432.5 512 448 496.5 448 477.3C448 381.6 370.4 304 274.7 304z"></path>
                        </svg>
                      )}
                      {userProfile && userByEmail?.postulado && (
                        <div className={s.divVisible}>
                          <label htmlFor="">Hacer visible mi postulacion</label>
                          <label className={s.switch}>
                            <input
                              onChange={(e) => handleVisible(e)}
                              type="checkbox"
                              name="visible"
                              defaultChecked={userByEmail?.visible}
                            />
                            <span className={s.slider_round}></span>
                          </label>
                        </div>
                      )}
                    </div>
                    <br />
                    <a
                      href={`mailto:${
                        userDetail?.email
                          ? userDetail?.email
                          : userByEmail?.email
                      }`}
                      className={s.link}
                    >
                      <span className={s.mail}>
                        <box-icon
                          border="circle"
                          color="white"
                          type="logo"
                          name="gmail"
                        ></box-icon>
                        Email:
                      </span>
                      <span>{`${
                        userDetail?.email
                          ? userDetail?.email
                          : userByEmail?.email
                      }`}</span>
                    </a>
                    <br />
                    <br />
                    <box-icon name="code-alt" color="white"></box-icon>
                    <span> Lenguajes: </span>
                    <span>
                      {userDetail?.lenguajes
                        ? userDetail?.lenguajes?.map((e) => e)
                        : userByEmail?.lenguajes?.map((e) => e)}
                    </span>
                    <br />
                    <br />
                    <box-icon color="white" name="donate-heart"></box-icon>
                    <span> Servicios: </span>
                    <span>
                      {userDetail?.servicios
                        ? userDetail?.servicios?.map((e) => e)
                        : userByEmail?.servicios?.map((e) => e)}
                    </span>
                    <br />
                    <br />
                    <a
                      href={
                        userDetail.linkedIn
                          ? userDetail.linkedIn
                          : userByEmail.linkedIn
                      }
                      className={s.link}
                    >
                      <box-icon
                        color="white"
                        name="linkedin"
                        type="logo"
                      ></box-icon>
                      <span>LinkedIn</span>
                    </a>
                    <br />
                    <br />
                    <box-icon color="white" name="mouse"></box-icon>
                    <span> Tecnologias: </span>
                    <span>
                      {userDetail?.tecnologias
                        ? userDetail?.tecnologias?.map((e) => e)
                        : userByEmail?.tecnologias?.map((e) => e)}
                    </span>
                    <br />
                    <br />
                    <box-icon name="world" color="white"></box-icon>
                    <span> Pais: </span>
                    <span>
                      {userDetail?.paiseId
                        ? userDetail?.paiseId
                        : userByEmail?.paiseId}
                    </span>
                    <br />
                    <br />
                    <a
                      href={
                        userDetail?.webSite
                          ? userByEmail?.webSite
                          : userDetail?.webSite
                      }
                      className={s.link}
                    >
                      <box-icon name="planet" color="white"></box-icon>
                      <span> Sitio Web </span>
                    </a>
                    <br />
                    <br />
                    <box-icon name="diamond" color="white"></box-icon>
                    <span>Años de Experiencia: </span>
                    <span>
                      {userByEmail?.yearsOfExperience
                        ? userDetail?.yearsOfExperience
                        : userDetail?.yearsOfExperience}
                    </span>
                    <br />
                    <br />
                    <box-icon name="dollar-circle" color="white"></box-icon>
                    <span>Presupuesto por día: </span>
                    <span>
                      {userDetail?.dailyBudget
                        ? userDetail?.dailyBudget
                        : userByEmail?.dailyBudget}
                    </span>
                    <br />
                    <br />
                    <box-icon name="star" color="white"></box-icon>
                    <span>Reputacion: </span>
                    <span>
                      {userDetail
                        ? "⭐".repeat(Math.floor(userDetail?.reputacion))
                        : "⭐".repeat(Math.floor(userByEmail?.reputacion))}
                    </span>
                  </div>
                  <div className={s.bodyButtons}>
                    {/* <button
                      className={s.buttonBack}
                      onClick={() => {
                        dispatch(detailReset());
                        navigate("/");
                      }}
                    >
                      HOME
                    </button> */}
                    {userProfile ? (
                      <div className={s.buttonsLogeado}>
                        <button
                          className={s.buttonBack}
                          onClick={() => navigate("/create")}
                        >
                          {userByEmail?.postulado
                            ? `Editar postulación`
                            : `Postularme`}
                        </button>
                        {userByEmail?.premium !== true ? (
                          <button
                            // href={linkPago}
                            className={s.buttonSub}
                            onClick={handlePremium}
                          >
                            Suscripción
                          </button>
                        ) : (
                          <button
                            // href={linkPago}
                            className={s.buttonSub}
                            onClick={handlePremiumOFF}
                          >
                            CANCELAR SUSCRIPCION
                          </button>
                        )}
                      </div>
                    ) : (
                      <button className={s.buttonL} onClick={handleContact}>
                        Contactame
                      </button>
                    )}
                    <button
                      className={s.buttonBack}
                      onClick={handleCleanAndBack}
                    >
                      Volver
                    </button>
                  </div>
                </div>
              </div>
              {
                <div className={s.divScrollContracts}>
                  {" "}
                  <button
                    className={s.scrollContracts}
                    onClick={() => scrollTo(refContracts)}
                  >
                    <BsChevronDoubleDown />
                  </button>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
      <div ref={refContracts}>
        {contratosArenderizar &&
          contratosArenderizar.map((cur) => {
            return (
              <div className={s.cardContrato}>
                <Contracts
                  description={cur.description}
                  date={cur.date}
                  expiration_date={cur.expiration_date}
                  status={cur.status}
                  price={cur.price}
                  aceptado={cur.aceptado}
                  idContrato={cur.id}
                  pagado={cur.pagado}
                />
              </div>
            );
          })}
        <div className={s.buttonTop}>
          <ScrollTopDetail className={s.buttonTop} />
        </div>
      </div>
    </div>
  );
}
